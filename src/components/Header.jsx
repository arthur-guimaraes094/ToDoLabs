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
  Command,
  Layers,
  LayoutGrid,
  Download,
  History,
  AlertTriangle
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
  selectedAssignee = null,
  onClearAssignee,
  selectedTag = null,
  onSelectTag,
  availableTags = [],
  overdueCount = 0,
  filterOverdueOnly = false,
  onToggleOverdueFilter,
  onExportCSV,
  onOpenActivityDrawer,
  selectedPriority,
  onPriorityChange,
  sortBy = 'DEFAULT',
  onSortChange,
  viewMode = 'fan',
  onViewModeChange,
  onOpenNewTaskModal,
  onOpenCommandPalette,
  taskStats = { total: 0, pending: 0, review: 0, done: 0 }
}) {
  const completionPercentage = taskStats.total > 0 
    ? Math.round((taskStats.done / taskStats.total) * 100) 
    : 0;

  const tagOptions = [
    { value: 'ALL', label: '🏷️ Todas as Tags' },
    ...availableTags.map((t) => ({ value: t, label: `🏷️ ${t}` }))
  ];

  return (
    <header className="glass-panel border-b border-[#004C94]/15 dark:border-slate-800/80 px-6 py-3 flex flex-col gap-3 shrink-0 bg-white dark:bg-[#131C31] transition-colors duration-200">
      {/* Top Row: Title, Filter Badges, Search & Primary Action */}
      <div className="flex items-center justify-between">
        {/* Active Project, Active Assignee & Active Tag Filter Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Folder className="w-5 h-5 text-[#F7941D]" />
            <h2 className="text-lg font-bold text-[#004C94] dark:text-white tracking-tight font-heading">
              {activeProject ? activeProject.name : 'Todos os Projetos'}
            </h2>
          </div>

          {activeProject?.description && (
            <span className="hidden lg:inline-block text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3 max-w-xs truncate font-medium">
              {activeProject.description}
            </span>
          )}

          {/* Active Assignee Filter Tag */}
          {selectedAssignee && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-[#004C94]/30 dark:border-blue-500/40 rounded-xl text-xs font-semibold text-[#004C94] dark:text-blue-300 shadow-2xs animate-in fade-in duration-150">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedAssignee.avatar_url} 
                alt={selectedAssignee.name}
                className="w-4 h-4 rounded-full bg-white border border-slate-300 dark:border-slate-700"
              />
              <span className="truncate max-w-[120px]">{selectedAssignee.name}</span>
              <button
                type="button"
                onClick={onClearAssignee}
                title="Limpar filtro de dev"
                aria-label="Limpar filtro de responsável"
                className="p-0.5 rounded hover:bg-blue-200/60 dark:hover:bg-blue-900/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] focus-visible:outline-none"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Tag Filter Indicator */}
          {selectedTag && selectedTag !== 'ALL' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-[#F7941D]/30 dark:border-amber-500/40 rounded-xl text-xs font-semibold text-[#d97706] dark:text-amber-300 shadow-2xs animate-in fade-in duration-150">
              <span className="font-mono">🏷️ {selectedTag}</span>
              <button
                type="button"
                onClick={() => onSelectTag && onSelectTag('ALL')}
                title="Limpar filtro de tag"
                aria-label="Limpar filtro de tag"
                className="p-0.5 rounded hover:bg-amber-200/60 dark:hover:bg-amber-900/60 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F7941D] focus-visible:outline-none"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Overdue Filter Indicator */}
          {filterOverdueOnly && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-2xs animate-in fade-in duration-150">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              <span>Apenas Atrasadas (<strong className="tabular-nums font-mono">{overdueCount}</strong>)</span>
              <button
                type="button"
                onClick={onToggleOverdueFilter}
                title="Limpar filtro de atrasadas"
                aria-label="Limpar filtro de atrasadas"
                className="p-0.5 rounded hover:bg-rose-200/60 dark:hover:bg-rose-900/60 text-rose-500 hover:text-rose-800 dark:hover:text-rose-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Search Bar, Activity Log, CSV Export & Action Button */}
        <div className="flex items-center gap-2.5">
          {/* Command Palette Trigger Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCommandPalette}
            title="Abrir Paleta de Comandos (Ctrl+K)"
            aria-label="Abrir Paleta de Comandos (Ctrl+K)"
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <Search className="w-4 h-4 text-[#F7941D]" aria-hidden="true" />
            <span className="hidden sm:inline font-medium">Buscar...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 shadow-xs">
              <Command className="w-2.5 h-2.5" aria-hidden="true" /> K
            </kbd>
          </motion.button>

          {/* Activity Log Drawer Trigger */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenActivityDrawer}
            title="Ver Histórico de Atividades"
            aria-label="Ver Histórico de Atividades"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <History className="w-4 h-4 text-[#004C94] dark:text-blue-400" aria-hidden="true" />
            <span className="hidden md:inline">Histórico</span>
          </motion.button>

          {/* Export CSV Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportCSV}
            title="Exportar Demandas em CSV"
            aria-label="Exportar Demandas em CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <Download className="w-4 h-4 text-[#F7941D]" aria-hidden="true" />
            <span className="hidden lg:inline">CSV</span>
          </motion.button>

          {/* Primary "+ Nova Demanda" Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenNewTaskModal()}
            aria-label="Criar nova demanda"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F7941D] via-[#e6830d] to-[#F7941D] hover:from-[#e07e0c] hover:to-[#f89e2f] text-slate-950 font-bold text-xs shadow-md shadow-[#F7941D]/20 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F7941D] focus-visible:outline-none"
          >
            <Plus className="w-4 h-4 stroke-[3] text-slate-950" aria-hidden="true" />
            <span className="hidden sm:inline">Nova Demanda</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Row: Completion Progress Bar, Tags Filter, Sorting & Priority Filters */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 gap-3">
        {/* Progress Bar & Counters */}
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progresso:</span>
            <div className="w-24 sm:w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300/50 dark:border-slate-700 relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#004C94] via-sky-500 to-[#F7941D]"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="font-mono text-[#d97706] dark:text-amber-400 font-bold text-xs tabular-nums">{completionPercentage}%</span>
          </div>

          <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#d97706] dark:text-amber-400" aria-hidden="true" /> <strong className="text-slate-900 dark:text-slate-200 font-mono tabular-nums">{taskStats.pending}</strong> pendentes
            </span>
            <span className="flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-[#004C94] dark:text-blue-400" aria-hidden="true" /> <strong className="text-slate-900 dark:text-slate-200 font-mono tabular-nums">{taskStats.review}</strong> em revisão
            </span>
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> <strong className="text-slate-900 dark:text-slate-200 font-mono tabular-nums">{taskStats.done}</strong> concluídas
            </span>

            {/* Overdue Tasks Badge / Toggle */}
            {overdueCount > 0 && (
              <button
                type="button"
                onClick={onToggleOverdueFilter}
                title={filterOverdueOnly ? "Desmarcar filtro de atrasadas" : "Filtrar apenas demandas atrasadas"}
                aria-label={filterOverdueOnly ? "Desmarcar filtro de atrasadas" : "Filtrar apenas demandas atrasadas"}
                aria-pressed={filterOverdueOnly}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none ${
                  filterOverdueOnly
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-bold'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 animate-pulse" aria-hidden="true" />
                <span><strong className="font-mono tabular-nums">{overdueCount}</strong> em atraso</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: View Mode, Tag Filter, Dynamic Sort & Priority Filter Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle: Leque vs Grade */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs" role="group" aria-label="Modo de visualização dos cards">
            <button
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('fan')}
              title="Modo Leque (Cards Sobrepostos)"
              aria-label="Modo Leque (Cards Sobrepostos)"
              aria-pressed={viewMode === 'fan'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none ${
                viewMode === 'fan'
                  ? 'bg-white dark:bg-[#1E293B] text-[#004C94] dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Leque</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange && onViewModeChange('grid')}
              title="Modo Grade (Cards Lado a Lado)"
              aria-label="Modo Grade (Cards Lado a Lado)"
              aria-pressed={viewMode === 'grid'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#1E293B] text-[#004C94] dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Grade</span>
            </button>
          </div>

          {/* Tag Filter Dropdown */}
          {availableTags.length > 0 && (
            <div className="w-36 sm:w-40">
              <CustomSelect
                id="filter-tag"
                options={tagOptions}
                value={selectedTag || 'ALL'}
                onChange={(val) => onSelectTag && onSelectTag(val)}
                placeholder="Filtrar por tag..."
              />
            </div>
          )}

          {/* Sorting Dropdown */}
          <div className="w-40 sm:w-48">
            <CustomSelect
              id="sort-tasks"
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={onSortChange}
              placeholder="Ordenar demandas..."
            />
          </div>

          {/* Priority Filter Pills */}
          <div className="hidden sm:flex items-center gap-1" role="group" aria-label="Filtro de prioridade">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-0.5" aria-hidden="true" />
            {PRIORITIES.map((p) => {
              const isSelected = selectedPriority === p.key;
              return (
                <motion.button
                  key={p.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPriorityChange(p.key)}
                  aria-label={`Filtrar por prioridade ${p.label}`}
                  aria-pressed={isSelected}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-[#004C94] dark:bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
