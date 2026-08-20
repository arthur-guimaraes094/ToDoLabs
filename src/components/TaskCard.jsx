'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitPullRequest, 
  Calendar, 
  User, 
  Trash2, 
  Edit3, 
  AlertTriangle 
} from 'lucide-react';
import { getTagStyle } from '@/lib/tags';

const PRIORITY_THEMES = {
  URGENTE: {
    badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold shadow-xs',
    cardBg: 'bg-[#fff5f5] dark:bg-[#1C1826]',
    trackBorder: 'bg-rose-200/90 dark:bg-rose-900/40',
    spotlightBeam: '#f43f5e',
    spotlightSecondary: 'rgba(225, 29, 72, 0.75)',
    titleHover: 'group-hover:text-rose-700 dark:group-hover:text-rose-400'
  },
  ALTA: {
    badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold',
    cardBg: 'bg-[#fffbf0] dark:bg-[#201D1A]',
    trackBorder: 'bg-amber-200/90 dark:bg-amber-900/40',
    spotlightBeam: '#F7941D',
    spotlightSecondary: 'rgba(217, 119, 6, 0.75)',
    titleHover: 'group-hover:text-[#d97706] dark:group-hover:text-amber-400'
  },
  MEDIA: {
    badge: 'bg-blue-100 dark:bg-blue-950/60 text-[#004C94] dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium',
    cardBg: 'bg-[#f0f7ff] dark:bg-[#131E33]',
    trackBorder: 'bg-blue-200/90 dark:bg-blue-900/40',
    spotlightBeam: '#004C94',
    spotlightSecondary: 'rgba(2, 132, 199, 0.75)',
    titleHover: 'group-hover:text-[#004C94] dark:group-hover:text-blue-400'
  },
  BAIXA: {
    badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-medium',
    cardBg: 'bg-[#f0fdf4] dark:bg-[#112217]',
    trackBorder: 'bg-emerald-200/90 dark:bg-emerald-900/40',
    spotlightBeam: '#10b981',
    spotlightSecondary: 'rgba(16, 185, 129, 0.75)',
    titleHover: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
  }
};

function findColumnAtPoint(pointX, pointY) {
  if (typeof document === 'undefined' || pointX == null || pointY == null) return null;
  const columns = document.querySelectorAll('[data-column-status]');
  for (const col of columns) {
    const rect = col.getBoundingClientRect();
    if (
      pointX >= rect.left &&
      pointX <= rect.right &&
      pointY >= rect.top &&
      pointY <= rect.bottom
    ) {
      return col.getAttribute('data-column-status');
    }
  }
  return null;
}

export default function TaskCard({ 
  task, 
  index = 0,
  viewMode = 'fan',
  isShifted = false,
  isCurrentHovered = false,
  isDraggingActive = false,
  onCardMouseEnter,
  onCardMouseLeave,
  onDragStartCard,
  onDragOverColumn,
  onDragEndCard,
  onEditTask, 
  onDeleteTask,
  onUpdateTaskStatus
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLocalDragging, setIsLocalDragging] = useState(false);
  const lastTargetStatusRef = useRef(null);

  const theme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.MEDIA;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'CONCLUIDA';

  const handleDragStart = () => {
    setIsLocalDragging(true);
    lastTargetStatusRef.current = null;
    if (onDragStartCard) onDragStartCard(task.id);
  };

  const handleDrag = (e, info) => {
    const pointX = info?.point?.x ?? e?.clientX;
    const pointY = info?.point?.y ?? e?.clientY;
    const status = findColumnAtPoint(pointX, pointY);

    if (status) {
      lastTargetStatusRef.current = status;
    }
    if (onDragOverColumn) onDragOverColumn(status);
  };

  const handleDragEnd = (e, info) => {
    setIsLocalDragging(false);
    const pointX = info?.point?.x ?? e?.clientX ?? (e?.changedTouches && e.changedTouches[0]?.clientX);
    const pointY = info?.point?.y ?? e?.clientY ?? (e?.changedTouches && e.changedTouches[0]?.clientY);

    let targetStatus = findColumnAtPoint(pointX, pointY);
    if (!targetStatus && lastTargetStatusRef.current) {
      targetStatus = lastTargetStatusRef.current;
    }

    if (onDragEndCard) onDragEndCard();

    if (targetStatus && targetStatus !== task.status && onUpdateTaskStatus) {
      onUpdateTaskStatus(task.id, targetStatus);
    }
    lastTargetStatusRef.current = null;
  };

  // Multi-assignees list (array of objects)
  const assigneesList = Array.isArray(task.assignees) && task.assignees.length > 0
    ? task.assignees
    : (task.assignee_avatar ? [{ id: task.assigned_to_id, name: task.assignee_name, avatar_url: task.assignee_avatar }] : []);

  const assigneesTooltip = assigneesList.map((a) => a.name).join(', ') || 'Ninguém atribuído';
  const isFanMode = viewMode === 'fan';

  return (
    // Outer Slot: Gerencia a posição relativa no leque, margem negativa e expansão em acordeão
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1,
        x: isFanMode && isShifted && !isDraggingActive ? 140 : 0 
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 350, 
        damping: 28,
        mass: 0.8
      }}
      style={{
        zIndex: isLocalDragging ? 9999 : isCurrentHovered ? 40 : isFanMode ? index + 1 : 1
      }}
      className={`relative ${
        isFanMode 
          ? 'shrink-0 -ml-28 sm:-ml-36 first:ml-0' 
          : 'w-full shrink-0 ml-0'
      }`}
    >
      {/* Inner Card: Objeto físico real com Arraste Livre, Hover Lift e Spotlight */}
      <motion.div
        drag
        dragSnapToOrigin={true}
        dragElastic={0.12}
        whileDrag={{ 
          scale: 1.04, 
          rotate: 1.5, 
          cursor: "grabbing"
        }}
        animate={{
          y: isCurrentHovered && !isLocalDragging ? -10 : 0,
          scale: isCurrentHovered && !isLocalDragging ? 1.01 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 28 
        }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onMouseMove={handleMouseMove}
        onMouseEnter={onCardMouseEnter}
        onMouseLeave={onCardMouseLeave}
        className={`relative ${
          isFanMode ? 'w-64 sm:w-72 min-w-[240px]' : 'w-full min-w-0'
        } h-[265px] rounded-2xl p-[1.5px] cursor-grab active:cursor-grabbing group select-none transition-shadow duration-150 ${
          isLocalDragging
            ? 'shadow-2xl ring-2 ring-[#004C94]/40'
            : isCurrentHovered 
            ? 'shadow-xl ring-1 ring-black/10 dark:ring-white/10' 
            : 'shadow-md hover:shadow-lg'
        }`}
      >
        {/* Base Border Track with Priority Color Tint */}
        <div className={`absolute inset-0 rounded-2xl ${theme.trackBorder} z-0`} />

        {/* Linear-Style Spotlight Border matching Priority Color in Stronger Vibrancy */}
        {isCurrentHovered && !isLocalDragging && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-0 transition-opacity duration-150"
            style={{
              background: `radial-gradient(280px circle at ${mousePosition.x}px ${mousePosition.y}px, ${theme.spotlightBeam} 0%, ${theme.spotlightSecondary} 50%, transparent 85%)`
            }}
          />
        )}

        {/* Card Surface */}
        <div className={`relative z-10 w-full h-full ${theme.cardBg} rounded-[14.5px] p-4 flex flex-col justify-between space-y-3`}>
          {/* Card Header: Priority Badge & Actions */}
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
              {task.priority || 'MEDIA'}
            </span>

            {/* Hover Actions: Edit / Delete */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(task);
                }}
                title="Editar Tarefa"
                aria-label="Editar tarefa"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                title="Excluir Tarefa"
                aria-label="Excluir tarefa"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/80 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Task Title & Description */}
          <div className="space-y-1.5 flex-1">
            <h4 className={`font-bold text-sm text-slate-900 dark:text-white ${theme.titleHover} transition-colors line-clamp-2 leading-snug`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Tags Pills Row */}
            {Array.isArray(task.tags) && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center pt-1">
                {task.tags.slice(0, 3).map((tag, idx) => {
                  const tagStyle = getTagStyle(tag);
                  return (
                    <span
                      key={idx}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs ${tagStyle.color}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tagStyle.dot }} />
                      <span className="truncate max-w-[85px]">{tag}</span>
                    </span>
                  );
                })}
                {task.tags.length > 3 && (
                  <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold px-1">
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* PR Link */}
          {task.pr_url && (
            <a
              href={task.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#004C94] dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 text-xs transition-colors w-fit font-medium"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-[#004C94] dark:text-blue-400" />
              <span className="font-mono text-[11px] truncate max-w-[120px]">PR / Commit</span>
            </a>
          )}

          {/* Footer: Soft Deadline & Multi-Assignee Avatar Stack */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 relative">
            {/* Soft Deadline */}
            {task.due_date ? (
              <div className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                {isOverdue ? <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 animate-pulse" /> : <Calendar className="w-3 h-3 text-slate-400" />}
                <span>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Sem prazo</span>
            )}

            {/* Multi-Assignee Avatars Stack */}
            <div className="flex items-center" title={assigneesTooltip}>
              {assigneesList.length > 0 ? (
                <div className="flex items-center -space-x-2">
                  {assigneesList.slice(0, 3).map((assignee, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={assignee.id || idx}
                      src={assignee.avatar_url}
                      alt={assignee.name}
                      title={assignee.name}
                      className="w-6 h-6 rounded-full bg-white dark:bg-[#131C31] ring-2 ring-white dark:ring-slate-800 border border-slate-300 dark:border-slate-700 shrink-0 shadow-2xs"
                    />
                  ))}
                  {assigneesList.length > 3 && (
                    <span className="w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                      +{assigneesList.length - 3}
                    </span>
                  )}
                </div>
              ) : (
                <div 
                  title="Sem dev atribuído"
                  className="w-6 h-6 rounded-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-[10px] shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
