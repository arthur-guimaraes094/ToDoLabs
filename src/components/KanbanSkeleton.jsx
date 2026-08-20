'use client';

import React from 'react';

const SKELETON_COLUMNS = [
  { title: 'Ideias / Backlog', color: '#8b5cf6' },
  { title: 'Em Análise', color: '#004C94' },
  { title: 'Desenvolvendo', color: '#0284c7' },
  { title: 'Em Revisão', color: '#F7941D' },
  { title: 'Concluída', color: '#10b981' },
  { title: 'Cancelada', color: '#64748b' }
];

export default function KanbanSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-pulse">
      {SKELETON_COLUMNS.map((col, colIdx) => (
        <div 
          key={colIdx} 
          className="w-full flex flex-col rounded-2xl glass-panel p-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#131C31]/90 shadow-xs space-y-4"
        >
          {/* Column Header Skeleton */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-3.5 h-3.5 rounded-full" 
                  style={{ backgroundColor: col.color, opacity: 0.7 }} 
                />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-full border border-slate-200/60 dark:border-slate-700/60" />
            </div>

            <div className="h-7 w-32 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          </div>

          {/* Cards Fan Skeleton */}
          <div className="pt-2 pb-4 px-2 flex items-center gap-4 overflow-hidden">
            {[1, 2, 3].map((cardIdx) => (
              <div
                key={cardIdx}
                className="w-64 sm:w-72 h-[240px] rounded-2xl p-4 bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 flex flex-col justify-between shrink-0"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700/60 rounded-full" />
                  <div className="h-4 w-10 bg-slate-200/60 dark:bg-slate-700/40 rounded-md" />
                </div>
                <div className="space-y-2 flex-1 pt-4">
                  <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-md" />
                  <div className="h-3 w-3/5 bg-slate-200/70 dark:bg-slate-700/60 rounded-md" />
                </div>
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between">
                  <div className="h-3 w-20 bg-slate-200/60 dark:bg-slate-700/40 rounded-md" />
                  <div className="flex items-center -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800" />
                    <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
