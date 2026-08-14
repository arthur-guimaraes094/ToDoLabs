'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

const COLUMN_CONFIG = {
  IDEIAS_BACKLOG: {
    title: 'Ideias / Backlog',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
    emptyText: '💡 Nenhuma ideia registrada nesta categoria'
  },
  EM_ANALISE: {
    title: 'Em Análise',
    color: '#004C94',
    badgeBg: 'bg-blue-100 text-[#004C94] border-blue-200',
    emptyText: '🔍 Nenhuma demanda em triagem nesta categoria'
  },
  DESENVOLVENDO: {
    title: 'Desenvolvendo',
    color: '#0284c7',
    badgeBg: 'bg-sky-100 text-sky-700 border-sky-200',
    emptyText: '⚙️ Nenhuma tarefa em execução nesta categoria'
  },
  EM_REVISAO: {
    title: 'Em Revisão',
    color: '#F7941D',
    badgeBg: 'bg-amber-100 text-[#d97706] border-amber-200',
    emptyText: '👀 Nenhuma revisão pendente nesta categoria'
  },
  CONCLUIDA: {
    title: 'Concluída',
    color: '#10b981',
    badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    emptyText: '✅ Nenhuma entrega concluída ainda nesta categoria'
  },
  CANCELADA: {
    title: 'Cancelada',
    color: '#64748b',
    badgeBg: 'bg-slate-100 text-slate-600 border-slate-200',
    emptyText: '🚫 Nenhuma demanda descartada nesta categoria'
  }
};

export default function KanbanColumn({ 
  statusKey, 
  tasks = [], 
  isOriginColumn = false,
  isTargetDrop = false,
  activeDraggingTaskId = null,
  onDragStartCard,
  onDragOverColumn,
  onDragEndCard,
  onEditTask, 
  onDeleteTask, 
  onUpdateTaskStatus,
  onOpenNewTaskModal 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const config = COLUMN_CONFIG[statusKey] || COLUMN_CONFIG.IDEIAS_BACKLOG;
  const isAnyDragging = Boolean(activeDraggingTaskId);

  return (
    <motion.div
      layout
      data-column-status={statusKey}
      id={`kanban-column-${statusKey}`}
      style={{
        zIndex: isOriginColumn ? 50 : isTargetDrop ? 40 : 1
      }}
      className={`w-full flex flex-col rounded-2xl glass-panel p-4 border transition-all duration-150 relative ${
        isOriginColumn || isAnyDragging ? 'overflow-visible' : 'overflow-hidden'
      } ${
        isTargetDrop 
          ? 'border-[#004C94] bg-blue-50/80 ring-2 ring-[#004C94]/40 shadow-md' 
          : 'border-slate-200/80 bg-white/90 shadow-xs'
      }`}
    >
      {/* Category Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title={isCollapsed ? "Expandir Categoria" : "Recolher Categoria"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center gap-2.5">
            <span 
              className="w-3.5 h-3.5 rounded-full shadow-xs" 
              style={{ backgroundColor: config.color }} 
            />
            <h3 className="font-bold text-base text-slate-800 font-heading">{config.title}</h3>
          </div>

          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}>
            {tasks.length} {tasks.length === 1 ? 'demanda' : 'demandas'}
          </span>
        </div>

        {/* Category Header Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => onOpenNewTaskModal(statusKey)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#004C94] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Demanda
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
            className={`pt-2 pb-2 ${isAnyDragging ? 'overflow-visible' : ''}`}
          >
            {tasks.length === 0 ? (
              <motion.div 
                onClick={() => onOpenNewTaskModal(statusKey)}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className={`w-full py-8 my-2 border border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center gap-2 group cursor-pointer transition-colors shadow-xs ${
                  isTargetDrop 
                    ? 'border-[#004C94] bg-blue-100/50 text-[#004C94]' 
                    : 'border-slate-300 hover:border-[#F7941D] bg-slate-50/50 hover:bg-white text-slate-500'
                }`}
              >
                <span className="text-xs font-semibold">
                  {isTargetDrop ? 'Solte a demanda aqui para mover' : config.emptyText}
                </span>
                {!isTargetDrop && (
                  <span className="text-xs text-[#d97706] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold">
                    <Plus className="w-4 h-4" /> Clique para adicionar uma nova demanda nesta categoria
                  </span>
                )}
              </motion.div>
            ) : (
              <div 
                onMouseLeave={() => setHoveredIndex(null)}
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
                      const isShifted = hoveredIndex !== null && index > hoveredIndex && !isAnyDragging;
                      const isCurrentHovered = hoveredIndex === index && !isAnyDragging;

                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          isShifted={isShifted}
                          isCurrentHovered={isCurrentHovered}
                          isDraggingActive={isDraggingThis}
                          onCardMouseEnter={() => !isAnyDragging && setHoveredIndex(index)}
                          onCardMouseLeave={() => !isAnyDragging && setHoveredIndex(null)}
                          onDragStartCard={(taskId) => {
                            setHoveredIndex(null);
                            if (onDragStartCard) onDragStartCard(taskId);
                          }}
                          onDragOverColumn={onDragOverColumn}
                          onDragEndCard={() => {
                            setHoveredIndex(null);
                            if (onDragEndCard) onDragEndCard();
                          }}
                          onEditTask={onEditTask}
                          onDeleteTask={onDeleteTask}
                          onUpdateTaskStatus={onUpdateTaskStatus}
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
