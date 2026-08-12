'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { User, Mail, Shield, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put('/users/me', {
        full_name: fullName,
        avatar_url: selectedAvatar,
      });
      toast.success('Profile updated successfully!');
      refreshUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-sky-500 dark:text-sky-400" /> Account Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile details, avatar selection, and security parameters.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Current Avatar Display */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Profile Avatar Selection
              </label>
              <div className="flex items-center gap-4 sm:gap-6 mb-4">
                <img
                  src={selectedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`}
                  alt="Selected Avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-sky-400 shadow-md object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{fullName || 'User Avatar'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click an avatar preset below to select your avatar</div>
                </div>
              </div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-2">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                      selectedAvatar === url
                        ? 'border-sky-500 ring-2 ring-sky-400/40 shadow-sm scale-105'
                        : 'border-slate-200 dark:border-navy-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-12 h-12 rounded-lg object-cover" />
                    {selectedAvatar === url && (
                      <div className="absolute inset-0 bg-sky-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-100 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* User Role Badge */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">System Role</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Administrative & project permissions</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-bold">
                {user?.role || 'USER'}
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md transition-all"
              >
                {updating ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
