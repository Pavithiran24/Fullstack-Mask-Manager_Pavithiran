'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Folder, CheckSquare, User, Moon, Sun, X, ArrowRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setLoading(true);
      api.get('/projects')
        .then((res) => setProjects(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  );

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-slate-950/60 dark:bg-navy-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-navy-700/60">
          <Search className="w-5 h-5 text-sky-500 dark:text-sky-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search projects, tasks, or jump to page... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-base font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {!query && (
            <div>
              <div className="px-3 py-1.5 text-xs font-bold tracking-wider text-sky-600 dark:text-sky-400 uppercase">
                Quick Actions
              </div>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => navigateTo('/dashboard')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800/80 text-left text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    <span className="font-medium text-sm">Executive Dashboard</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => navigateTo('/projects')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800/80 text-left text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    <span className="font-medium text-sm">All Projects</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => navigateTo('/profile')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800/80 text-left text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    <span className="font-medium text-sm">Account Settings</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => {
                    toggleTheme();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800/80 text-left text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white group transition-all"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-sky-500" />}
                    <span className="font-medium text-sm">Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-navy-700 px-2 py-0.5 rounded-md">Toggle</span>
                </button>
              </div>
            </div>
          )}

          {/* Projects Results */}
          <div>
            <div className="px-3 py-1.5 text-xs font-bold tracking-wider text-sky-600 dark:text-sky-400 uppercase">
              Projects ({filteredProjects.length})
            </div>
            <div className="space-y-1 mt-1">
              {filteredProjects.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-slate-400">
                  No projects found matching "{query}"
                </div>
              ) : (
                filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`/projects/${p.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800/80 text-left group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center flex-shrink-0 text-sky-600 dark:text-sky-400 font-bold text-xs">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{p.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.description || 'No description'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium">
                        {p.stats?.total || 0} tasks
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-navy-950/80 border-t border-slate-200 dark:border-navy-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Navigate with mouse or click</span>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded text-slate-600 dark:text-slate-300">Esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
