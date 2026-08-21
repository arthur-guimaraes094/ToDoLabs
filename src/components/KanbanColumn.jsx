'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { Plus, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const COLUMN_CONFIG = {
  IDEIAS_BACKLOG: {
    title: 'Ideias / Backlog',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    emptyTitle: 'Nenhuma ideia ou demanda no backlog',
    emptyDesc: 'Registre novos insights, requisitos de negócio ou tarefas a priorizar.'
  },
  EM_ANALISE: {
    title: 'Em Análise',
    color: '#004C94',
    badgeBg: 'bg-blue-100 text-[#004C94] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    emptyTitle: 'Nenhuma demanda em triagem',
    emptyDesc: 'Arraste uma ideia para cá para detalhar escopo e requisitos técnicos.'
  },
  DESENVOLVENDO: {
    title: 'Desenvolvendo',
    color: '#0284c7',
    badgeBg: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    emptyTitle: 'Nenhuma tarefa em execução ativa',
    emptyDesc: 'Mova demandas aprovadas para cá durante o sprint de desenvolvimento.'
  },
  EM_REVISAO: {
    title: 'Em Revisão',
    color: '#F7941D',
    badgeBg: 'bg-amber-100 text-[#d97706] border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    emptyTitle: 'Nenhuma revisão de código pendente',
    emptyDesc: 'Demandas com Pull Request aberto aparecem aqui para validação de pares.'
  },
  CONCLUIDA: {
    title: 'Concluída',
    color: '#10b981',
    badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    emptyTitle: 'Nenhuma entrega concluída ainda',
    emptyDesc: 'Arraste tarefas finalizadas para cá para celebrar com confetti!'
  },
  CANCELADA: {
    title: 'Cancelada',
    color: '#64748b',
    badgeBg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    emptyTitle: 'Nenhuma demanda descartada',
    emptyDesc: 'Ideias descontinuadas ou duplicadas ficam registradas aqui.'
  }
};

export default function KanbanColumn({ 
  statusKey, 
  tasks = [], 
  viewMode = 'fan',
  isOriginColumn = false,
  isTargetDrop = false,
  activeDraggingTaskId = null,
  onDragStartCard,
  onDragOverColumn,
  onDragEndCard,
  onEditTask, 
  onDeleteTask, 
  onUpdateTaskStatus,
  onOpenNewTaskModal,
  onCopyTask
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [openMenuTaskId, setOpenMenuTaskId] = useState(null);

  const config = COLUMN_CONFIG[statusKey] || COLUMN_CONFIG.IDEIAS_BACKLOG;
  const isAnyDragging = Boolean(activeDraggingTaskId);

  // Se houver um menu de atalho aberto, o hover fica travado no card correspondente
  const activeMenuIndex = openMenuTaskId 
    ? tasks.findIndex((t) => t.id === openMenuTaskId) 
    : -1;
  const effectiveHoveredIndex = activeMenuIndex !== -1 ? activeMenuIndex : hoveredIndex;

  return (
    <motion.div
      layout
      data-column-status={statusKey}
      id={`kanban-column-${statusKey}`}
      style={{
        zIndex: isOriginColumn ? 50 : isTargetDrop ? 40 : openMenuTaskId ? 60 : 1
      }}
      className={`w-full flex flex-col rounded-2xl glass-panel p-4 border transition-all duration-150 relative ${
        isOriginColumn || isAnyDragging || openMenuTaskId ? 'overflow-visible' : 'overflow-hidden'
      } ${
        isTargetDrop 
          ? 'border-[#004C94] dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-[#004C94]/40 shadow-md' 
          : 'border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#131C31]/90 shadow-xs'
      }`}
    >
      {/* Category Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? `Expandir categoria ${config.title}` : `Recolher categoria ${config.title}`}
            aria-expanded={!isCollapsed}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
            title={isCollapsed ? "Expandir Categoria" : "Recolher Categoria"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" aria-hidden="true" /> : <ChevronUp className="w-4 h-4" aria-hidden="true" />}
          </button>
          
          <div className="flex items-center gap-2.5">
            <span 
              className="w-3.5 h-3.5 rounded-full shadow-xs" 
              style={{ backgroundColor: config.color }} 
              aria-hidden="true"
            />
            <h3 className="font-bold text-base text-slate-800 dark:text-white font-heading">{config.title}</h3>
          </div>

          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border tabular-nums ${config.badgeBg}`}>
            {tasks.length} {tasks.length === 1 ? 'demanda' : 'demandas'}
          </span>
        </div>

        {/* Category Header Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => onOpenNewTaskModal(statusKey)}
            aria-label={`Adicionar nova demanda em ${config.title}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#004C94] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Adicionar Demanda
          </button>
        </div>
      </div>

      {/* Category Section Content: Fila de Cartas com Overflow Visível Durante o Arraste */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`pt-2 pb-2 ${isAnyDragging || openMenuTaskId ? 'overflow-visible' : ''}`}
          >
            {tasks.length === 0 ? (
              <motion.div 
                onClick={() => onOpenNewTaskModal(statusKey)}
                whileHover={{ scale: 1.003 }}
                whileTap={{ scale: 0.997 }}
                className={`w-full py-7 my-2 border border-dashed rounded-2xl flex flex-col items-center justify-center p-5 text-center gap-2.5 group cursor-pointer transition-all duration-150 shadow-2xs ${
                  isTargetDrop 
                    ? 'border-[#004C94] dark:border-blue-500 bg-blue-100/50 dark:bg-blue-950/30 text-[#004C94] dark:text-blue-300 ring-2 ring-[#004C94]/20' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-[#004C94] dark:hover:border-blue-500/60 bg-slate-50/40 dark:bg-[#0E1526]/40 hover:bg-white dark:hover:bg-[#152238] text-slate-600 dark:text-slate-400'
                }`}
              >
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs"
                  style={{ backgroundColor: `${config.color}15`, color: config.color }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isTargetDrop ? 'Solte a demanda aqui para mover' : config.emptyTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-xs">
                    {isTargetDrop ? 'A demanda será atualizada para esta etapa imediatamente.' : config.emptyDesc}
                  </p>
                </div>
                {!isTargetDrop && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#004C94] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1 rounded-lg border border-blue-200/60 dark:border-blue-800/60 mt-1 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Adicionar Demanda
                  </span>
                )}
              </motion.div>
            ) : viewMode === 'grid' ? (
              /* Grid View Mode */
              <div className="pt-3 pb-3 px-1">
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                >
                  <AnimatePresence>
                    {tasks.map((task, index) => {
                      const isDraggingThis = activeDraggingTaskId === task.id;

                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          viewMode="grid"
                          isShifted={false}
                          isCurrentHovered={false}
                          isDraggingActive={isDraggingThis}
                          onDragStartCard={(taskId) => {
                            if (onDragStartCard) onDragStartCard(taskId);
                          }}
                          onDragOverColumn={onDragOverColumn}
                          onDragEndCard={() => {
                            if (onDragEndCard) onDragEndCard();
                          }}
                          onEditTask={onEditTask}
                          onDeleteTask={onDeleteTask}
                          onUpdateTaskStatus={onUpdateTaskStatus}
                          onCopyTask={onCopyTask}
                        />
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            ) : (
              /* Fan (Leque) View Mode */
              <div 
                onMouseLeave={() => {
                  if (!openMenuTaskId) setHoveredIndex(null);
                }}
                className={`overflow-y-visible pt-5 pb-5 px-3 flex items-center min-h-[300px] ${
                  isAnyDragging 
                    ? 'overflow-x-visible' 
                    : 'overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200'
                }`}
              >
                <motion.div 
                  layout
                  className="flex items-center flex-nowrap pr-24"
                >
                  <AnimatePresence>
                    {tasks.map((task, index) => {
                      const isDraggingThis = activeDraggingTaskId === task.id;
                      const isShifted = effectiveHoveredIndex !== null && index > effectiveHoveredIndex && !isAnyDragging;
                      const isCurrentHovered = effectiveHoveredIndex === index && !isAnyDragging;
                      const isMenuOpen = openMenuTaskId === task.id;

                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          viewMode="fan"
                          isShifted={isShifted}
                          isCurrentHovered={isCurrentHovered}
                          isDraggingActive={isDraggingThis}
                          isMoveMenuOpen={isMenuOpen}
                          onToggleMoveMenu={(open) => setOpenMenuTaskId(open ? task.id : null)}
                          onCardMouseEnter={() => {
                            if (!isAnyDragging && !openMenuTaskId) {
                              setHoveredIndex(index);
                            }
                          }}
                          onDragStartCard={(taskId) => {
                            setHoveredIndex(null);
                            setOpenMenuTaskId(null);
                            if (onDragStartCard) onDragStartCard(taskId);
                          }}
                          onDragOverColumn={onDragOverColumn}
                          onDragEndCard={() => {
                            setHoveredIndex(null);
                            setOpenMenuTaskId(null);
                            if (onDragEndCard) onDragEndCard();
                          }}
                          onEditTask={onEditTask}
                          onDeleteTask={onDeleteTask}
                          onUpdateTaskStatus={onUpdateTaskStatus}
                          onCopyTask={onCopyTask}
                        />
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
