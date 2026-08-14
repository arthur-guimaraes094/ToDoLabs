'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Folder, 
  SlidersHorizontal, 
  ArrowUpDown,
  Command
} from 'lucide-react';
import CustomSelect from './CustomSelect';

const PRIORITIES = [
  { key: 'ALL', label: 'Todas' },
  { key: 'URGENTE', label: '🔴 Urgente' },
  { key: 'ALTA', label: '🟡 Alta' },
  { key: 'MEDIA', label: '🔵 Média' },
  { key: 'BAIXA', label: '🟢 Baixa' }
];

const SORT_OPTIONS = [
  { value: 'DEFAULT', label: '⏱️ Criação (Padrão)' },
  { value: 'PRIORITY_DESC', label: '🔴 Prioridade: Urgente → Baixa' },
  { value: 'PRIORITY_ASC', label: '🟢 Prioridade: Baixa → Urgente' },
  { value: 'DUE_DATE_ASC', label: '📅 Prazo: Mais Próximo' },
  { value: 'DUE_DATE_DESC', label: '📅 Prazo: Mais Distante' }
];

export default function Header({ 
  activeProject, 
  searchTerm, 
  onSearchChange, 
  selectedPriority,
  onPriorityChange,
  sortBy = 'DEFAULT',
  onSortChange,
  onOpenNewTaskModal,
  onOpenCommandPalette,
  taskStats = { total: 0, pending: 0, review: 0, done: 0 }
}) {
  const completionPercentage = taskStats.total > 0 
    ? Math.round((taskStats.done / taskStats.total) * 100) 
    : 0;

  return (
    <header className="glass-panel border-b border-[#004C94]/15 px-6 py-3 flex flex-col gap-3 shrink-0 bg-white">
      {/* Top Row: Title, Stats & Primary Action */}
      <div className="flex items-center justify-between">
        {/* Active Project Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Folder className="w-5 h-5 text-[#F7941D]" />
            <h2 className="text-lg font-bold text-[#004C94] tracking-tight font-heading">
              {activeProject ? activeProject.name : 'Todos os Projetos'}
            </h2>
          </div>

          {activeProject?.description && (
            <span className="hidden lg:inline-block text-xs text-slate-500 border-l border-slate-200 pl-3 max-w-xs truncate font-medium">
              {activeProject.description}
            </span>
          )}
        </div>

        {/* Search Bar, Command Palette Shortcut & Action Button */}
        <div className="flex items-center gap-3">
          {/* Command Palette Trigger Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCommandPalette}
            title="Abrir Paleta de Comandos (Ctrl+K)"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
          >
            <Search className="w-4 h-4 text-[#F7941D]" />
            <span className="hidden sm:inline font-medium">Buscar...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-slate-500 border border-slate-300 shadow-xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </motion.button>

          {/* Primary "+ Nova Demanda" Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenNewTaskModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F7941D] via-[#e6830d] to-[#F7941D] hover:from-[#e07e0c] hover:to-[#f89e2f] text-slate-950 font-bold text-xs shadow-md shadow-[#F7941D]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3] text-slate-950" />
            <span className="hidden sm:inline">Nova Demanda</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Row: Completion Progress Bar, Priority Filters & Dynamic Sorting */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-2.5 gap-3">
        {/* Progress Bar & Counters */}
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Progresso:</span>
            <div className="w-24 sm:w-32 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/50 relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#004C94] via-sky-500 to-[#F7941D]"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="font-mono text-[#d97706] font-bold text-xs">{completionPercentage}%</span>
          </div>

          <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 pl-4">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#d97706]" /> <strong className="text-slate-900 font-mono">{taskStats.pending}</strong> pendentes
            </span>
            <span className="flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-[#004C94]" /> <strong className="text-slate-900 font-mono">{taskStats.review}</strong> em revisão
            </span>
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> <strong className="text-slate-900 font-mono">{taskStats.done}</strong> concluídas
            </span>
          </div>
        </div>

        {/* Right Controls: Dynamic Sort & Priority Filter Pills */}
        <div className="flex items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="w-48 sm:w-56">
            <CustomSelect
              id="sort-tasks"
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={onSortChange}
              placeholder="Ordenar demandas..."
            />
          </div>

          {/* Priority Filter Pills */}
          <div className="hidden sm:flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
            {PRIORITIES.map((p) => {
              const isSelected = selectedPriority === p.key;
              return (
                <motion.button
                  key={p.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPriorityChange(p.key)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#004C94] text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
