'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, Shield, Menu, PanelLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  onOpenMobileMenu?: () => void;
  onOpenCommandPalette: () => void;
}

export function AppHeader({ onToggleSidebar, onOpenMobileMenu, onOpenCommandPalette }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return 'Executive Dashboard';
    if (pathname === '/projects') return 'Projects Hub';
    if (pathname.startsWith('/projects/')) {
      if (pathname.endsWith('/tasks')) return 'Tasks & Kanban Board';
      return 'Project Workspace';
    }
    if (pathname === '/profile') return 'User Profile & Security';
    return 'Dashboard';
  };

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 transition-colors">
      {/* Sidebar Toggle & Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-xl bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {getBreadcrumb()}
        </h1>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:border-sky-500 transition-all text-xs font-medium"
        >
          <Search className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          <span className="hidden sm:inline">Search or press</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white dark:bg-navy-950 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800">
            ⌘K
          </kbd>
        </button>

        {/* Admin Role Pill */}
        {user?.role === 'ADMIN' && (
          <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold border border-sky-500/20">
            <Shield className="w-3.5 h-3.5" /> Admin Access
          </span>
        )}

        {/* Notifications Icon */}
        <button className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-navy-700 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        </button>
      </div>
    </header>
  );
}
