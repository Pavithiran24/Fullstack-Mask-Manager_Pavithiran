'use client';

import React from 'react';
import { Download, Printer, X, Sparkles, CheckCircle2, Shield, Users } from 'lucide-react';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: any;
  dashboardData?: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    overallCompletion: number;
    projects: any[];
  };
  type: 'project' | 'dashboard';
}

export function PdfReportModal({ isOpen, onClose, project, dashboardData, type }: PdfReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      {/* Modal Card */}
      <div className="w-full max-w-4xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black print:max-w-none">
        
        {/* Action Toolbar (Hidden during printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Executive PDF Report Generator
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md transition-all"
            >
              <Printer className="w-4 h-4" /> Download / Print PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PDF Document Body */}
        <div className="space-y-6 text-slate-900 dark:text-slate-100 print:text-black print:bg-white">
          
          {/* PDF Header */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-700 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-sm">
                  AF
                </div>
                <span className="text-xl font-extrabold tracking-tight">Acme Flow SaaS</span>
              </div>
              <p className="text-xs text-slate-500 print:text-slate-600">Enterprise Project Management Executive Report</p>
            </div>
            <div className="text-right text-xs text-slate-500 print:text-slate-600 space-y-0.5">
              <div>Date Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>Report ID: REP-{Math.floor(100000 + Math.random() * 900000)}</div>
              <div className="text-sky-600 font-semibold print:text-black">CONFIDENTIAL</div>
            </div>
          </div>

          {/* PROJECT REPORT TYPE */}
          {type === 'project' && project && (
            <div className="space-y-6">
              {/* Project Title Banner */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 print:bg-slate-50 print:border-slate-300">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white print:text-black">{project.name}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 print:text-slate-700">
                  {project.description || 'No description provided.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-black">
                  <div>Project Owner: <span className="text-sky-600 font-bold">{project.owner?.full_name || 'Admin'}</span></div>
                  <div>Team Members: <span className="font-bold">{project.members?.length || 0} Members</span></div>
                  <div>Total Tasks: <span className="font-bold">{project.tasks?.length || 0} Tasks</span></div>
                </div>
              </div>

              {/* Metrics Breakdown Grid */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 print:bg-slate-50 print:border-slate-300">
                  <div className="text-xs text-slate-500 font-semibold">Completion Rate</div>
                  <div className="text-2xl font-black text-sky-600 mt-1">{project.statistics?.completion_rate || 0}%</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 print:bg-slate-50 print:border-slate-300">
                  <div className="text-xs text-slate-500 font-semibold">Completed Tasks</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{project.tasks?.filter((t: any) => t.status === 'DONE').length || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 print:bg-slate-50 print:border-slate-300">
                  <div className="text-xs text-slate-500 font-semibold">In Progress</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">{project.tasks?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 print:bg-slate-50 print:border-slate-300">
                  <div className="text-xs text-slate-500 font-semibold">Backlog (Todo)</div>
                  <div className="text-2xl font-black text-slate-600 mt-1">{project.tasks?.filter((t: any) => t.status === 'TODO').length || 0}</div>
                </div>
              </div>

              {/* Tasks Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 print:text-black">
                  Project Tasks Breakdown
                </h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-navy-800 rounded-xl print:border-slate-300">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 font-semibold uppercase print:bg-slate-100 print:text-black">
                      <tr>
                        <th className="p-3">Task Title</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Assignee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-navy-800 print:divide-slate-200">
                      {project.tasks?.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white print:text-black">{t.title}</td>
                          <td className="p-3 font-bold">
                            <span className={t.status === 'DONE' ? 'text-emerald-600' : t.status === 'IN_PROGRESS' ? 'text-amber-600' : 'text-slate-500'}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3 font-bold">{t.priority}</td>
                          <td className="p-3">{t.assignee?.full_name || 'Unassigned'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD REPORT TYPE */}
          {type === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 print:bg-slate-50 print:border-slate-300">
                  <div className="text-xs text-slate-500 font-semibold">Total Projects</div>
                  <div className="text-2xl font-black text-sky-600 mt-1">{dashboardData.totalProjects}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 print:bg-slate-50 print:border-slate-300">
                  <div className="text-xs text-slate-500 font-semibold">Total Tasks</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{dashboardData.totalTasks}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 print:bg-slate-50 print:border-slate-300">
                  <div className="text-xs text-slate-500 font-semibold">Completed</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{dashboardData.completedTasks}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 print:bg-slate-50 print:border-slate-300">
                  <div className="text-xs text-slate-500 font-semibold">Velocity Rate</div>
                  <div className="text-2xl font-black text-sky-600 mt-1">{dashboardData.overallCompletion}%</div>
                </div>
              </div>

              {/* Projects Summary */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 print:text-black">
                  Portfolio Projects Status
                </h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-navy-800 rounded-xl print:border-slate-300">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 font-semibold uppercase print:bg-slate-100 print:text-black">
                      <tr>
                        <th className="p-3">Project Name</th>
                        <th className="p-3">Total Tasks</th>
                        <th className="p-3">Done</th>
                        <th className="p-3">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-navy-800 print:divide-slate-200">
                      {dashboardData.projects.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white print:text-black">{p.name}</td>
                          <td className="p-3">{p.stats?.total || 0}</td>
                          <td className="p-3 text-emerald-600 font-bold">{p.stats?.done || 0}</td>
                          <td className="p-3 font-bold">{p.stats?.progress || 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Footer Signature Block */}
          <div className="pt-6 border-t border-slate-200 dark:border-navy-700 flex justify-between items-center text-[10px] text-slate-500 print:text-slate-600">
            <div>Acme Flow SaaS Executive Analytics Engine</div>
            <div>Authorized Corporate Approval</div>
          </div>
        </div>

      </div>
    </div>
  );
}
