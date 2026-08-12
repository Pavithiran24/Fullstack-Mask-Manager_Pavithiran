'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  FileText,
  PieChart,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PdfReportModal } from '@/components/ui/PdfReportModal';
import { toast } from 'sonner';

export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks'),
        ]);
        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        toast.error('Failed to load executive metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'DONE').length;

  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const dashboardData = {
    totalProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overallCompletion,
    projects,
  };

  return (
    <AppLayout>
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        type="dashboard"
        dashboardData={dashboardData}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-8 max-w-7xl mx-auto"
      >
        {/* Executive Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-sky-100 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Real-time Portfolio Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.full_name || 'Executive'} 👋
              </h1>
              <p className="text-sky-100 text-xs sm:text-sm max-w-xl">
                Here is your high-level overview of active projects, task completion velocity, and team throughput metrics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/30 transition-all shadow-md"
              >
                <FileText className="w-4 h-4 text-sky-200" /> Export PDF Report
              </button>

              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sky-700 hover:bg-slate-50 font-bold text-xs sm:text-sm shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" /> Create Project
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Projects</span>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '...' : totalProjects}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cross-functional workspaces</p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tasks</span>
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '...' : totalTasks}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{inProgressTasks} currently in progress</p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completion Velocity</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '...' : `${overallCompletion}%`}</div>
              <div className="w-full bg-slate-100 dark:bg-navy-950 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallCompletion}%` }} />
              </div>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical Priority</span>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{loading ? '...' : highPriorityTasks}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">High priority active items</p>
            </div>
          </motion.div>
        </div>

        {/* Visual Analytics & Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Analytics Chart Panel */}
          <div className="lg:col-span-1 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-sky-500" /> Task Status Distribution
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{completedTasks} tasks</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-navy-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> In Progress
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{inProgressTasks} tasks</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-navy-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500" /> To Do (Backlog)
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{todoTasks} tasks</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-navy-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 text-center">
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold transition-all border border-sky-500/20 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> Download Executive PDF Report
              </button>
            </div>
          </div>

          {/* Active Projects Roster */}
          <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Active Projects Portfolio</h3>
              <Link href="/projects" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1">
                View All ({projects.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-navy-950 skeleton-shimmer" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No active projects found. Create one to get started.</div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-sky-500 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-xs flex-shrink-0">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                          {p.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {p.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{p.stats?.progress || 0}%</div>
                        <div className="text-[11px] text-slate-500">{p.stats?.done || 0}/{p.stats?.total || 0} tasks</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
