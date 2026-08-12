'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ShieldCheck,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface AppSidebarProps {
  collapsed: boolean;
  mobileMenuOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onOpenCommandPalette: () => void;
}

export function AppSidebar({
  collapsed,
  mobileMenuOpen,
  onToggleCollapse,
  onCloseMobile,
  onOpenCommandPalette,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Profile Settings', href: '/profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-all duration-300 ease-in-out border-r bg-white dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 shadow-xl overflow-hidden ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-16' : 'md:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-slate-200 dark:border-navy-800/80 flex-shrink-0">
          {!collapsed ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 p-0.5 flex-shrink-0 shadow-glow-sky">
                  <div className="w-full h-full bg-white dark:bg-navy-950 rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  </div>
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Project Hub</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Workspace</span>
                </div>
              </Link>
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-300 border border-slate-200 dark:border-navy-700/60 transition-colors flex-shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="w-full flex items-center justify-center group"
              title="Expand Sidebar"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 p-0.5 flex-shrink-0 shadow-glow-sky group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white dark:bg-navy-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                </div>
              </div>
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Button */}
        <div className="p-2 flex-shrink-0">
          <button
            onClick={() => {
              onOpenCommandPalette();
              onCloseMobile();
            }}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center w-10 h-10 mx-auto p-0' : 'px-3 py-2'
            } rounded-xl bg-slate-100 dark:bg-navy-900/90 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-xs group`}
            title="Quick Search (⌘K)"
          >
            <Search className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0" />
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between ml-2.5">
                <span>Search...</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-navy-950 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-navy-700">
                  ⌘K
                </kbd>
              </div>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-2 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Menu
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={`flex items-center ${
                  collapsed ? 'justify-center w-10 h-10 mx-auto p-0' : 'gap-3 px-3 py-2.5'
                } rounded-xl transition-all font-medium text-sm group relative ${
                  active
                    ? 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 font-semibold border border-sky-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-navy-900/60'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-sky-500 dark:bg-sky-400 rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Controls */}
        <div className="p-2 border-t border-slate-200 dark:border-navy-800/80 space-y-2 bg-slate-50 dark:bg-navy-950/80 flex-shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center w-10 h-10 mx-auto p-0' : 'px-3 py-2'
            } rounded-xl bg-white dark:bg-navy-900/60 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700/40 transition-all text-xs font-semibold`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600 flex-shrink-0" />
            )}
            {!collapsed && (
              <span className="ml-2.5 font-medium truncate">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {/* User Bar */}
          {user && (
            <div
              className={`flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-navy-700/60 ${
                collapsed ? 'justify-center w-10 h-10 mx-auto p-0' : 'justify-between'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`}
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full border border-sky-400/40 object-cover flex-shrink-0"
                  title={collapsed ? user.full_name : undefined}
                />
                {!collapsed && (
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1">
                      {user.full_name}
                      {user.role === 'ADMIN' && (
                        <span title="Admin User" className="inline-flex items-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</span>
                  </div>
                )}
              </div>

              {!collapsed && (
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
