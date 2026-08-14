'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GitPullRequest, 
  Calendar, 
  User, 
  Trash2, 
  Edit3, 
  AlertTriangle
} from 'lucide-react';

const PRIORITY_THEMES = {
  URGENTE: {
    badge: 'bg-rose-100 text-rose-700 border-rose-300 font-bold shadow-xs',
    cardBg: 'bg-[#fff5f5]',
    trackBorder: 'bg-rose-200/90',
    spotlightBeam: '#f43f5e',
    spotlightSecondary: 'rgba(225, 29, 72, 0.75)',
    titleHover: 'group-hover:text-rose-700'
  },
  ALTA: {
    badge: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    cardBg: 'bg-[#fffbf0]',
    trackBorder: 'bg-amber-200/90',
    spotlightBeam: '#F7941D',
    spotlightSecondary: 'rgba(217, 119, 6, 0.75)',
    titleHover: 'group-hover:text-[#d97706]'
  },
  MEDIA: {
    badge: 'bg-blue-100 text-[#004C94] border-blue-200 font-medium',
    cardBg: 'bg-[#f0f7ff]',
    trackBorder: 'bg-blue-200/90',
    spotlightBeam: '#004C94',
    spotlightSecondary: 'rgba(2, 132, 199, 0.75)',
    titleHover: 'group-hover:text-[#004C94]'
  },
  BAIXA: {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium',
    cardBg: 'bg-[#f0fdf4]',
    trackBorder: 'bg-emerald-200/90',
    spotlightBeam: '#10b981',
    spotlightSecondary: 'rgba(5, 150, 105, 0.75)',
    titleHover: 'group-hover:text-emerald-700'
  }
};

export default function TaskCard({ 
  task, 
  index = 0,
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
    if (onDragStartCard) onDragStartCard(task.id);
  };

  const handleDrag = (e, info) => {
    if (typeof document === 'undefined') return;
    const elements = document.elementsFromPoint(info.point.x, info.point.y);
    const col = elements.find(
      (el) => el.getAttribute && el.getAttribute('data-column-status')
    );
    const status = col ? col.getAttribute('data-column-status') : null;
    if (onDragOverColumn) onDragOverColumn(status);
  };

  const handleDragEnd = (e, info) => {
    setIsLocalDragging(false);
    if (typeof document !== 'undefined') {
      const elements = document.elementsFromPoint(info.point.x, info.point.y);
      const col = elements.find(
        (el) => el.getAttribute && el.getAttribute('data-column-status')
      );
      const targetStatus = col ? col.getAttribute('data-column-status') : null;
      
      if (onDragEndCard) onDragEndCard();

      if (targetStatus && targetStatus !== task.status && onUpdateTaskStatus) {
        onUpdateTaskStatus(task.id, targetStatus);
      }
    } else {
      if (onDragEndCard) onDragEndCard();
    }
  };

  // Multi-assignees list (array of objects)
  const assigneesList = Array.isArray(task.assignees) && task.assignees.length > 0
    ? task.assignees
    : (task.assignee_avatar ? [{ id: task.assigned_to_id, name: task.assignee_name, avatar_url: task.assignee_avatar }] : []);

  const assigneesTooltip = assigneesList.map((a) => a.name).join(', ') || 'Ninguém atribuído';

  return (
    // Outer Slot: Gerencia a posição relativa no leque, margem negativa e expansão em acordeão
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1,
        x: isShifted && !isDraggingActive ? 140 : 0 
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 350, 
        damping: 28,
        mass: 0.8
      }}
      style={{
        zIndex: isLocalDragging ? 9999 : isCurrentHovered ? 40 : index + 1
      }}
      className="relative shrink-0 -ml-28 sm:-ml-36 first:ml-0"
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
        className={`relative w-64 sm:w-72 min-w-[240px] h-[265px] rounded-2xl p-[1.5px] cursor-grab active:cursor-grabbing group select-none transition-shadow duration-150 ${
          isLocalDragging
            ? 'shadow-2xl ring-2 ring-[#004C94]/40'
            : isCurrentHovered 
            ? 'shadow-xl ring-1 ring-black/10' 
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
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(task);
                }}
                title="Editar Tarefa"
                aria-label="Editar tarefa"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                title="Excluir Tarefa"
                aria-label="Excluir tarefa"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white/80 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Task Title & Description */}
          <div className="space-y-1.5 flex-1">
            <h4 className={`font-bold text-sm text-slate-900 ${theme.titleHover} transition-colors line-clamp-3 leading-snug`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* PR Link */}
          {task.pr_url && (
            <a
              href={task.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 hover:text-[#004C94] border border-slate-200/80 text-xs transition-colors w-fit font-medium"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-[#004C94]" />
              <span className="font-mono text-[11px] truncate max-w-[120px]">PR / Commit</span>
            </a>
          )}

          {/* Footer: Soft Deadline & Multi-Assignee Avatar Stack */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            {/* Soft Deadline */}
            {task.due_date ? (
              <div className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                {isOverdue ? <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" /> : <Calendar className="w-3 h-3 text-slate-400" />}
                <span>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Sem prazo</span>
            )}

            {/* Multi-Assignee Avatars Stack */}
            <div className="flex items-center" title={assigneesTooltip}>
              {assigneesList.length > 0 ? (
                <div className="flex items-center -space-x-2">
                  {assigneesList.slice(0, 3).map((assignee, idx) => (
                    <img
                      key={assignee.id || idx}
                      src={assignee.avatar_url}
                      alt={assignee.name}
                      title={assignee.name}
                      className="w-6 h-6 rounded-full bg-white ring-2 ring-white border border-slate-300 shrink-0 shadow-2xs"
                    />
                  ))}
                  {assigneesList.length > 3 && (
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white">
                      +{assigneesList.length - 3}
                    </span>
                  )}
                </div>
              ) : (
                <div 
                  title="Sem dev atribuído"
                  className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] shrink-0"
                >
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
