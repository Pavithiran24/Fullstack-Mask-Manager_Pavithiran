import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const updateMeSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').optional(),
  avatar_url: z.string().url('Invalid URL').optional(),
});

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const data = updateMeSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        created_at: true,
      },
      orderBy: { full_name: 'asc' },
    });

    return res.json(users);
  } catch (error) {
    next(error);
  }
};
