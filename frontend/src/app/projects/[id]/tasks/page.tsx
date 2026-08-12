'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  FolderKanban,
  Trash2,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const fetchProjectTasks = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
    } catch (err: any) {
      toast.error('Failed to load project tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProjectTasks();
  }, [projectId]);

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
      fetchProjectTasks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      handleUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-96 rounded-3xl bg-slate-200 dark:bg-navy-900 skeleton-shimmer border border-slate-300 dark:border-navy-800" />
      </AppLayout>
    );
  }

  if (!project) return null;

  let tasks: any[] = project.tasks || [];
  if (filterPriority !== 'ALL') {
    tasks = tasks.filter((t) => t.priority === filterPriority);
  }

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="p-2 rounded-xl bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Back to Project Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <FolderKanban className="w-6 h-6 text-sky-500 dark:text-sky-400" /> {project.name} - Kanban Board
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Drag and drop tasks between columns to update status in real-time.
              </p>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-navy-950 p-1.5 rounded-xl border border-slate-200 dark:border-navy-800 self-start sm:self-auto">
            <Filter className="w-4 h-4 text-sky-500 dark:text-sky-400 ml-2" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1 hidden sm:inline">Priority:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterPriority === p
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Columns Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TODO Column */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'TODO')}
            className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-5 space-y-4 min-h-[450px] shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>To Do</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-navy-800">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {todoTasks.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-sky-500 cursor-grab transition-all space-y-2 shadow-sm"
                >
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{t.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{t.description}</div>
                  <div className="pt-2 flex justify-between items-center text-[10px]">
                    <span className="font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300">
                      {t.priority}
                    </span>
                    <button
                      onClick={() => handleUpdateTaskStatus(t.id, 'IN_PROGRESS')}
                      className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
                    >
                      Start →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IN_PROGRESS Column */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
            className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-5 space-y-4 min-h-[450px] shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>In Progress</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 text-amber-600 dark:text-amber-400 text-xs font-bold border border-slate-200 dark:border-navy-800">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {inProgressTasks.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-amber-500/30 hover:border-amber-400/60 cursor-grab transition-all space-y-2 shadow-sm"
                >
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{t.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{t.description}</div>
                  <div className="pt-2 flex justify-between items-center text-[10px]">
                    <span className="font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      {t.priority}
                    </span>
                    <button
                      onClick={() => handleUpdateTaskStatus(t.id, 'DONE')}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      Done ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DONE Column */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'DONE')}
            className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-5 space-y-4 min-h-[450px] shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <div className="flex items-center gap-2 font-bold text-sm text-sky-600 dark:text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Done</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 text-sky-600 dark:text-sky-400 text-xs font-bold border border-slate-200 dark:border-navy-800">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {doneTasks.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-sky-500/30 hover:border-sky-400/60 cursor-grab transition-all space-y-2 opacity-90 shadow-sm"
                >
                  <div className="font-semibold text-sm text-slate-700 dark:text-slate-200 line-through decoration-sky-500">
                    {t.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{t.description}</div>
                  <div className="pt-2 flex justify-between items-center text-[10px]">
                    <span className="font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300">
                      DONE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
