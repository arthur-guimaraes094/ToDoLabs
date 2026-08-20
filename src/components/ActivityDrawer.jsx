'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  History, 
  Sparkles, 
  CheckCircle2, 
  MoveRight, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Users, 
  Folder,
  Clock
} from 'lucide-react';

const ACTION_ICONS = {
  TASK_CREATED: { icon: PlusCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  TASK_MOVED: { icon: MoveRight, color: 'text-[#004C94] bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  TASK_UPDATED: { icon: Edit3, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  TASK_DELETED: { icon: Trash2, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  PROJECT_CREATED: { icon: Folder, color: 'text-[#F7941D] bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' },
  PROJECT_DELETED: { icon: Trash2, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  USER_CREATED: { icon: Users, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800' },
  USER_DELETED: { icon: Users, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  SYSTEM_INIT: { icon: Sparkles, color: 'text-[#004C94] bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' }
};

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'agora mesmo';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `há ${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `há ${diffInDays}d`;
  return date.toLocaleDateString('pt-BR');
}

export default function ActivityDrawer({
  isOpen,
  onClose,
  activities = [],
  isLoading = false,
  onRefresh
}) {
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredActivities = activities.filter((act) => {
    if (filter === 'TASK') return act.entity_type === 'TASK';
    if (filter === 'PROJECT') return act.entity_type === 'PROJECT';
    if (filter === 'USER') return act.entity_type === 'USER';
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-[#131C31] text-slate-800 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#004C94]/15 dark:bg-blue-900/40 border border-[#004C94]/30 flex items-center justify-center text-[#004C94] dark:text-blue-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-heading">
                    Log de Atividades
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Histórico de alterações em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={onClose}
                  aria-label="Fechar painel de atividades"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/50 dark:bg-[#0E1526]">
              {[
                { key: 'ALL', label: 'Todas' },
                { key: 'TASK', label: 'Demandas' },
                { key: 'PROJECT', label: 'Projetos' },
                { key: 'USER', label: 'Equipe' }
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setFilter(pill.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filter === pill.key
                      ? 'bg-[#004C94] text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Activities Timeline List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs font-mono">
                  <div className="w-6 h-6 border-2 border-[#004C94] border-t-transparent rounded-full animate-spin" />
                  Carregando histórico...
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhuma atividade registrada nesta categoria.
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 pl-4">
                  {filteredActivities.map((act) => {
                    const actionInfo = ACTION_ICONS[act.action_type] || ACTION_ICONS.SYSTEM_INIT;
                    const IconComponent = actionInfo.icon;

                    return (
                      <div key={act.id} className="relative group">
                        {/* Timeline Bullet Node */}
                        <div className={`absolute -left-[25px] top-1.5 w-5 h-5 rounded-full border flex items-center justify-center ${actionInfo.color} shadow-xs`}>
                          <IconComponent className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>

                        {/* Activity Card */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A243B] border border-slate-200/80 dark:border-slate-800/80 hover:border-[#004C94]/40 dark:hover:border-blue-500/40 transition-colors">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                            <span className="font-mono uppercase font-bold text-[#004C94] dark:text-blue-400">
                              {act.entity_type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatTimeAgo(act.created_at)}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                            {act.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with summary */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1526] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono">
                Total de {filteredActivities.length} logs
              </span>
              <button
                onClick={onRefresh}
                className="text-[#004C94] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Atualizar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
