import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
});

const addMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID')
    .or(z.string().min(1, 'User ID is required')), // support UUID or custom ID string
  role: z.enum(['OWNER', 'MEMBER']).optional().default('MEMBER'),
});

export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let projects;

    if (userRole === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: {
          owner: {
            select: { id: true, full_name: true, email: true, avatar_url: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, full_name: true, email: true, avatar_url: true },
              },
            },
          },
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { updated_at: 'desc' },
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { owner_id: userId },
            { members: { some: { user_id: userId } } },
          ],
        },
        include: {
          owner: {
            select: { id: true, full_name: true, email: true, avatar_url: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, full_name: true, email: true, avatar_url: true },
              },
            },
          },
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { updated_at: 'desc' },
      });
    }

    // Enhance response with task status statistics
    const enhancedProjects = await Promise.all(
      projects.map(async (project) => {
        const tasks = await prisma.task.findMany({
          where: { project_id: project.id },
          select: { status: true },
        });

        const todoCount = tasks.filter((t) => t.status === 'TODO').length;
        const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
        const doneCount = tasks.filter((t) => t.status === 'DONE').length;
        const totalTasks = tasks.length;
        const progressPercentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

        return {
          ...project,
          stats: {
            total: totalTasks,
            todo: todoCount,
            in_progress: inProgressCount,
            done: doneCount,
            progress: progressPercentage,
          },
        };
      })
    );

    return res.json(enhancedProjects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const data = projectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        owner_id: userId,
        members: {
          create: {
            user_id: userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
        members: {
          include: {
            user: { select: { id: true, full_name: true, email: true, avatar_url: true } },
          },
        },
      },
    });

    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjectDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true, avatar_url: true, role: true },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, full_name: true, email: true, avatar_url: true },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = project.tasks;
    const todoCount = tasks.filter((t) => t.status === 'TODO').length;
    const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const doneCount = tasks.filter((t) => t.status === 'DONE').length;
    const totalTasks = tasks.length;

    const highPriorityCount = tasks.filter((t) => t.priority === 'HIGH').length;
    const mediumPriorityCount = tasks.filter((t) => t.priority === 'MEDIUM').length;
    const lowPriorityCount = tasks.filter((t) => t.priority === 'LOW').length;

    const progressPercentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    return res.json({
      ...project,
      statistics: {
        total_tasks: totalTasks,
        todo_tasks: todoCount,
        in_progress_tasks: inProgressCount,
        done_tasks: doneCount,
        completion_rate: progressPercentage,
        priority_breakdown: {
          high: highPriorityCount,
          medium: mediumPriorityCount,
          low: lowPriorityCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = projectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        owner: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
      },
    });

    return res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id },
    });

    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id: project_id } = req.params;
    const data = addMemberSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: data.user_id } });
    if (!user) {
      return res.status(404).json({ message: 'User to add not found' });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: {
          project_id,
          user_id: data.user_id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    const member = await prisma.projectMember.create({
      data: {
        project_id,
        user_id: data.user_id,
        role: data.role,
      },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar_url: true, role: true },
        },
      },
    });

    return res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id: project_id, userId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: project_id } });
    if (project && project.owner_id === userId) {
      return res.status(400).json({ message: 'Cannot remove the owner of the project' });
    }

    await prisma.projectMember.delete({
      where: {
        project_id_user_id: {
          project_id,
          user_id: userId,
        },
      },
    });

    return res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};
