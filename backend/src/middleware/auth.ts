import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { prisma } from '../db/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
};

export const requireRole = (role: 'ADMIN' | 'USER') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
};

export const requireProjectMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const projectId = req.params.projectId || req.params.id;

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admins can access all projects
  if (userRole === 'ADMIN') {
    return next();
  }

  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    });

    if (!membership) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project || project.owner_id !== userId) {
        return res.status(403).json({ message: 'Access denied: You are not a member of this project' });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify project membership' });
  }
};
