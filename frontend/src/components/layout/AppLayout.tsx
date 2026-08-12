'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { Toaster } from 'sonner';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Toaster position="top-right" theme="system" richColors />

      {/* App Sidebar (Desktop + Mobile) */}
      <AppSidebar
        collapsed={collapsed}
        mobileMenuOpen={mobileMenuOpen}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-h-screen w-full ${
          collapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <AppHeader
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Cmd+K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
