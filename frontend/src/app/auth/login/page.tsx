'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, UserCheck, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to log in. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setLoading(true);
    setError('');
    try {
      await login(demoEmail, 'Password123!');
      toast.success(`Logged in as ${demoEmail}`);
    } catch (err: any) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-navy-950 relative overflow-hidden transition-colors">
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Card Container */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sign In</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enter your credentials to access your workspace dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-navy-800">
            <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider mb-3">
              One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@acme.com')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800 text-xs font-medium text-sky-600 dark:text-sky-300 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-sky-500" />
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('alex@acme.com')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                Demo User
              </button>
            </div>
          </div>
        </div>

        {/* Footer Redirect */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link href="/auth/register" className="text-sky-500 font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
