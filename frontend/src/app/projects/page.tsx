'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  FolderKanban,
  Search,
  Plus,
  LayoutGrid,
  List as ListIcon,
  X,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterTag, setFilterTag] = useState<'ALL' | 'MINE'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc,
      });
      toast.success('Project created successfully!');
      setNewProjectName('');
      setNewProjectDesc('');
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    if (filterTag === 'MINE') {
      return matchesSearch && p.owner_id === user?.id;
    }
    return matchesSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-sky-500 dark:text-sky-400" /> Projects Workspace Hub
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Manage enterprise projects, team roster allocations, and task velocity tracking.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Create New Project
          </button>
        </div>

        {/* Filter & Toolbar Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-sky-500 dark:text-sky-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search projects by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-10 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-all"
            />
          </div>

          {/* Active Tag Pills & View Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Tag Pills */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-navy-950 p-1 rounded-xl border border-slate-200 dark:border-navy-800">
              <button
                onClick={() => setFilterTag('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterTag === 'ALL'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({projects.length})
              </button>
              <button
                onClick={() => setFilterTag('MINE')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterTag === 'MINE'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Mine
              </button>
            </div>

            {/* Grid vs List View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-navy-950 p-1 rounded-xl border border-slate-200 dark:border-navy-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'list' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects View Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-slate-200 dark:bg-navy-900 skeleton-shimmer border border-slate-300 dark:border-navy-800" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-2xl bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 space-y-4">
            <FolderKanban className="w-14 h-14 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Projects Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No projects match your search criteria. Try modifying your search or create a new project.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" /> Create New Project
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 hover:border-sky-500 transition-all shadow-sm hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-sm">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                      {project.stats?.progress || 0}% Complete
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{project.stats?.total || 0} Total Tasks</span>
                    <span className="text-sky-600 dark:text-sky-400 font-medium">{project.stats?.done || 0} Done</span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-navy-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 dark:bg-sky-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${project.stats?.progress || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center -space-x-2">
                      {project.members?.slice(0, 4).map((m: any) => (
                        <img
                          key={m.id}
                          src={m.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user.full_name}`}
                          alt={m.user.full_name}
                          className="w-7 h-7 rounded-full border-2 border-white dark:border-navy-900 object-cover"
                          title={m.user.full_name}
                        />
                      ))}
                    </div>

                    <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Open Hub <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 hover:border-sky-500 transition-all group gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-sm flex-shrink-0">
                    {project.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {project.stats?.progress || 0}% Done
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {project.stats?.done || 0} / {project.stats?.total || 0} tasks
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-navy-950/80 backdrop-blur-md">
            <div className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-sky-500 dark:text-sky-400" /> Create Project
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mobile App Redesign"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Description & Scope
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly summarize objectives..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
