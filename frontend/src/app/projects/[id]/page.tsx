'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  FolderKanban,
  List,
  Users,
  PieChart,
  Plus,
  Trash2,
  UserPlus,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PdfReportModal } from '@/components/ui/PdfReportModal';
import { toast } from 'sonner';

type Tab = 'overview' | 'kanban' | 'list' | 'members';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskAssignee, setTaskAssignee] = useState<string>('');
  const [taskDueDate, setTaskDueDate] = useState<string>('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [allSystemUsers, setAllSystemUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const fetchProjectDetail = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load project');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProjectDetail();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }
    setCreatingTask(true);
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        priority: taskPriority,
        assignee_id: taskAssignee || null,
        due_date: taskDueDate || null,
      });
      toast.success('Task created successfully!');
      setTaskTitle('');
      setTaskDesc('');
      setIsTaskModalOpen(false);
      fetchProjectDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (newStatus === 'DONE') {
        toast.success('🎉 Task Completed! Velocity increased.', {
          description: 'Great job staying on top of project goals.',
        });
      } else {
        toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
      }
      fetchProjectDetail();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProjectDetail();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this entire project? This action cannot be undone.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted');
      router.push('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const openMemberModal = async () => {
    try {
      const usersRes = await api.get('/users');
      setAllSystemUsers(usersRes.data);
    } catch (err) {
      setAllSystemUsers([
        { id: 'admin-id', full_name: 'Elena Rostova (Admin)', email: 'admin@acme.com' },
        { id: 'user-alex', full_name: 'Alex Rivera', email: 'alex@acme.com' },
        { id: 'user-sarah', full_name: 'Sarah Chen', email: 'sarah@acme.com' },
        { id: 'user-david', full_name: 'David Vance', email: 'david@acme.com' },
      ]);
    }
    setIsMemberModalOpen(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user to add');
      return;
    }
    setAddingMember(true);
    try {
      await api.post(`/projects/${projectId}/members`, {
        user_id: selectedUserId,
        role: 'MEMBER',
      });
      toast.success('Team member added successfully!');
      setIsMemberModalOpen(false);
      fetchProjectDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member from project?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      toast.success('Member removed');
      fetchProjectDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
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
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-40 rounded-3xl bg-slate-200 dark:bg-navy-900 skeleton-shimmer border border-slate-300 dark:border-navy-800" />
          <div className="h-96 rounded-3xl bg-slate-200 dark:bg-navy-900 skeleton-shimmer border border-slate-300 dark:border-navy-800" />
        </div>
      </AppLayout>
    );
  }

  if (!project) return null;

  const tasks: any[] = project.tasks || [];
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');
  const stats = project.statistics || { completion_rate: 0, total_tasks: tasks.length };

  return (
    <AppLayout>
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        type="project"
        project={project}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* Project Details Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {project.name.substring(0, 2).toUpperCase()}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{project.name}</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl">
                {project.description || 'No description provided for this corporate workspace.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-navy-700 transition-all shadow-sm"
              >
                <FileText className="w-4 h-4 text-sky-500" /> Export PDF Report
              </button>

              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>

              {(project.owner_id === currentUser?.id || currentUser?.role === 'ADMIN') && (
                <button
                  onClick={handleDeleteProject}
                  className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 border-t border-slate-100 dark:border-navy-800 pt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <PieChart className="w-4 h-4" /> Overview & Stats
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                activeTab === 'kanban'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <FolderKanban className="w-4 h-4" /> Kanban Board
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                activeTab === 'list'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <List className="w-4 h-4" /> Task List
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                activeTab === 'members'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <Users className="w-4 h-4" /> Team Members ({project.members?.length || 0})
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completion Velocity</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">{stats.completion_rate}%</div>
                <div className="w-full bg-slate-100 dark:bg-navy-950 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-sky-500 dark:bg-sky-400 h-full rounded-full" style={{ width: `${stats.completion_rate}%` }} />
                </div>
              </div>

              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Tasks</span>
                <div className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-3">{doneTasks.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Out of {tasks.length} total tasks</p>
              </div>

              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Progress</span>
                <div className="text-3xl font-black text-amber-500 dark:text-amber-400 mt-3">{inProgressTasks.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active work in flight</p>
              </div>

              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Backlog (Todo)</span>
                <div className="text-3xl font-black text-slate-700 dark:text-slate-300 mt-3">{todoTasks.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending assignment & action</p>
              </div>
            </div>

            {/* Team Roster Summary */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Project Team Roster</span>
                <button
                  onClick={() => setActiveTab('members')}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Manage Roster →
                </button>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {project.members?.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                    <img
                      src={m.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user.full_name}`}
                      alt={m.user.full_name}
                      className="w-10 h-10 rounded-full border border-sky-400/40 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        {m.user.full_name}
                        {m.role === 'OWNER' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{m.user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KANBAN BOARD */}
        {activeTab === 'kanban' && (
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
                {todoTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, task.id)}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-sky-500 cursor-grab active:cursor-grabbing transition-all space-y-3 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          task.priority === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : task.priority === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-navy-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assignee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.full_name}`}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-[11px] truncate max-w-[90px]">{task.assignee.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                          className="px-2 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-700 dark:text-sky-300 text-[10px] font-semibold transition-colors"
                        >
                          Start →
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
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
                {inProgressTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, task.id)}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-amber-500/30 hover:border-amber-400/60 cursor-grab active:cursor-grabbing transition-all space-y-3 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                        {task.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-navy-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assignee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.full_name}`}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-[11px] truncate max-w-[90px]">{task.assignee.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'DONE')}
                          className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold transition-colors"
                        >
                          Done ✓
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
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
                {doneTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, task.id)}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-sky-500/30 hover:border-sky-400/60 cursor-grab transition-all space-y-3 group shadow-sm opacity-90"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200 line-through decoration-sky-500">
                        {task.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                        DONE
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-navy-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assignee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.full_name}`}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-[11px] truncate max-w-[90px]">{task.assignee.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                      )}

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TASK LIST */}
        {activeTab === 'list' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">All Tasks ({tasks.length})</h3>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-semibold shadow-sm"
              >
                + New Task
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-navy-800">
                  <tr>
                    <th className="p-4">Title & Scope</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Assignee</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900 dark:text-white max-w-xs">
                        <div className="font-semibold text-sm">{task.title}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1">{task.description}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as any)}
                          className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none"
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md ${
                            task.priority === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                              : 'bg-slate-500/20 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={task.assignee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.full_name}`}
                              className="w-6 h-6 rounded-full"
                            />
                            <span>{task.assignee.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TEAM MEMBERS */}
        {activeTab === 'members' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-500 dark:text-sky-400" /> Team Roster Management
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage member access and role permissions for this workspace.
                </p>
              </div>

              <button
                onClick={openMemberModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md"
              >
                <UserPlus className="w-4 h-4" /> Add Team Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.members?.map((m: any) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user.full_name}`}
                      alt={m.user.full_name}
                      className="w-10 h-10 rounded-full border border-sky-400/40 object-cover"
                    />
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {m.user.full_name}
                        {m.role === 'OWNER' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{m.user.email}</div>
                    </div>
                  </div>

                  {m.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemoveMember(m.user_id)}
                      className="p-2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATE TASK MODAL */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-navy-950/80 backdrop-blur-md">
            <div className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-sky-500 dark:text-sky-400" /> Create Task in {project.name}
                </h3>
                <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Build Auth Middleware"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide acceptance criteria..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Status Column
                    </label>
                    <select
                      value={taskStatus}
                      onChange={(e) => setTaskStatus(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none text-sm"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Priority Level
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none text-sm"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Assignee
                  </label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none text-sm"
                  >
                    <option value="">Unassigned</option>
                    {project.members?.map((m: any) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.full_name} ({m.user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingTask}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md"
                  >
                    {creatingTask ? 'Saving...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD MEMBER MODAL */}
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-navy-950/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sky-500 dark:text-sky-400" /> Add Team Member
                </h3>
                <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Select User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none text-sm"
                  >
                    <option value="">-- Choose User to Invite --</option>
                    {allSystemUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setIsMemberModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingMember}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md"
                  >
                    {addingMember ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
