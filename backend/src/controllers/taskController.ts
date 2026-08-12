import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  assignee_id: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assignee_id: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
});

export const getAllUserTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let tasks;
    if (userRole === 'ADMIN') {
      tasks = await prisma.task.findMany({
        include: {
          assignee: {
            select: { id: true, full_name: true, email: true, avatar_url: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          project: {
            OR: [
              { owner_id: userId },
              { members: { some: { user_id: userId } } },
            ],
          },
        },
        include: {
          assignee: {
            select: { id: true, full_name: true, email: true, avatar_url: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    }

    return res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId, search } = req.query;

    const whereClause: any = {
      project_id: projectId,
    };

    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    if (priority && typeof priority === 'string') {
      whereClause.priority = priority;
    }

    if (assigneeId && typeof assigneeId === 'string') {
      whereClause.assignee_id = assigneeId;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const data = createTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        project_id: projectId,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignee_id: data.assignee_id || null,
        due_date: data.due_date ? new Date(data.due_date) : null,
      },
      include: {
        assignee: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateTaskSchema.parse(req.body);

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignee_id !== undefined) updateData.assignee_id = data.assignee_id;
    if (data.due_date !== undefined) {
      updateData.due_date = data.due_date ? new Date(data.due_date) : null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
      },
    });

    return res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id },
    });

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
