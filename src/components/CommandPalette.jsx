'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Layers, 
  Users, 
  Command, 
  ChevronRight
} from 'lucide-react';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  projects = [], 
  tasks = [], 
  onSelectProject, 
  onOpenNewTaskModal, 
  onOpenNewProjectModal, 
  onOpenTeamModal,
  onEditTask
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTasks = query.trim() === '' 
    ? tasks.slice(0, 4) 
    : tasks.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(query.toLowerCase())) ||
        (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
      ).slice(0, 5);

  const filteredProjects = query.trim() === '' 
    ? projects 
    : projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#131C31] w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col text-slate-800 dark:text-slate-200">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-[#0E1526]">
          <Search className="w-5 h-5 text-[#F7941D] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Digite um comando ou busque demandas no projeto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 space-y-4 max-h-96 overflow-y-auto">
          {/* Quick Actions */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5">
              Ações Rápidas
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenNewTaskModal();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#F7941D]/15 dark:hover:bg-amber-950/40 hover:text-slate-950 dark:hover:text-amber-300 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#F7941D]/20 text-[#d97706] dark:text-amber-400 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span>Criar Nova Demanda</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onOpenNewProjectModal();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#004C94]/10 dark:hover:bg-blue-950/40 hover:text-[#004C94] dark:hover:text-blue-400 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#004C94]/15 text-[#004C94] dark:text-blue-400 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span>Criar Novo Projeto</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onOpenTeamModal();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span>Gerenciar Time de Desenvolvedores</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </button>
            </div>
          </div>

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5">
                Demandas
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onEditTask(t);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="truncate font-medium">{t.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5">
                Projetos
              </div>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color_code }} />
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Alternar Quadro</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1526] text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium">
            <Command className="w-3.5 h-3.5 text-[#004C94] dark:text-blue-400" /> Paleta de Comandos ToDoLabs
          </span>
          <span>Pressione <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">ESC</kbd> para sair</span>
        </div>
      </div>
    </div>
  );
}
