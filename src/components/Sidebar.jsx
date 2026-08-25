'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderPlus, 
  Settings, 
  Sparkles, 
  WifiOff, 
  Layers,
  ChevronRight,
  ShieldCheck,
  Code2,
  Users,
  Edit3,
  X,
  Sun,
  Moon
} from 'lucide-react';

function SidebarInner({
  projects = [],
  activeProjectId = null,
  onSelectProject,
  onOpenNewProjectModal,
  onEditProjectModal,
  teamUsers = [],
  selectedAssigneeId = null,
  onSelectAssignee,
  onOpenTeamModal,
  isDarkMode = false,
  onToggleDarkMode,
  dbStatus = { status: 'online', latencyMs: 12 },
  isMobile = false,
  onClose
}) {
  return (
    <div className="flex flex-col justify-between h-full">
      {/* Top Section: Brand & Nav Links */}
      <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#004C94] via-blue-600 to-[#F7941D] flex items-center justify-center shadow-md shadow-[#004C94]/20 ring-2 ring-white/10 shrink-0">
              <Layers className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                ToDoLabs
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#F7941D] block -mt-1 font-mono">
                DEV
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
              aria-label={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-[#F7941D]" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-[#004C94]" aria-hidden="true" />
              )}
            </button>

            {/* Mobile Close Drawer Button */}
            {isMobile && (
              <button
                type="button"
                onClick={onClose}
                title="Fechar Menu"
                aria-label="Fechar menu lateral"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] focus-visible:outline-none"
              >
                <X className="w-5 h-5 text-slate-700 dark:text-slate-200" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Projetos ({projects.length})
            </span>
            <button
              onClick={onOpenNewProjectModal}
              title="Criar Novo Projeto"
              aria-label="Criar novo projeto"
              className="p-1 rounded-lg text-slate-400 hover:text-[#004C94] dark:hover:text-blue-400 hover:bg-[#004C94]/10 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              <FolderPlus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-1">
            {/* All Projects Option */}
            <button
              onClick={() => onSelectProject(null)}
              aria-label="Visualizar todos os projetos"
              aria-pressed={activeProjectId === null}
              className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none ${
                activeProjectId === null
                  ? 'bg-gradient-to-r from-[#004C94]/15 to-[#004C94]/5 text-[#004C94] dark:text-blue-300 border-[#004C94]/40 dark:border-blue-500/40 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" aria-hidden="true" />
                <span className={`text-xs font-semibold ${
                  activeProjectId === null ? 'text-[#004C94] dark:text-blue-300 font-bold' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  Todos os Projetos
                </span>
              </div>
            </button>

            {/* Projects List */}
            {projects.map((proj) => {
              const isActive = activeProjectId === proj.id;
              return (
                <div key={proj.id} className="relative group">
                  <button
                    onClick={() => onSelectProject(proj.id)}
                    aria-label={`Selecionar projeto ${proj.name}`}
                    aria-pressed={isActive}
                    className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none ${
                      isActive
                        ? 'bg-gradient-to-r from-[#004C94]/15 to-[#004C94]/5 text-[#004C94] dark:text-blue-300 border-[#F7941D]/50 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: proj.color_code || proj.color || '#F7941D' }} 
                        aria-hidden="true" 
                      />
                      <span className={`text-xs font-semibold truncate ${
                        isActive ? 'text-[#004C94] dark:text-blue-300 font-bold' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {proj.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditProjectModal) {
                            onEditProjectModal(proj);
                          }
                        }}
                        title="Editar Projeto"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-[#F7941D] hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all cursor-pointer focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#F7941D] focus-visible:outline-none"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                      {proj.task_count !== undefined && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono tabular-nums">
                          {proj.task_count}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Members List */}
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#F7941D]" aria-hidden="true" /> Equipe ({teamUsers.length})
              </span>
              {selectedAssigneeId && (
                <button
                  onClick={() => onSelectAssignee && onSelectAssignee(null)}
                  title="Limpar filtro de dev"
                  aria-label="Limpar filtro de responsável"
                  className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:outline-none rounded"
                >
                  <X className="w-2.5 h-2.5" aria-hidden="true" /> Limpar
                </button>
              )}
            </div>
            <button
              onClick={onOpenTeamModal}
              title="Gerenciar Time"
              aria-label="Gerenciar equipe"
              className="p-1 rounded-lg text-slate-400 hover:text-[#004C94] dark:hover:text-blue-400 hover:bg-[#004C94]/10 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-1.5">
            {teamUsers.map((user) => {
              const isSelected = selectedAssigneeId === user.id;
              const roleUpper = (user.role || '').toUpperCase();
              const isLead = roleUpper === 'TECH_LEAD' || roleUpper === 'LEAD' || roleUpper.includes('LEAD') || roleUpper.includes('TECH');

              return (
                <button 
                  key={user.id} 
                  type="button"
                  onClick={() => onSelectAssignee && onSelectAssignee(isSelected ? null : user.id)}
                  aria-label={isSelected ? `Remover filtro de ${user.name}` : `Filtrar demandas de ${user.name}`}
                  aria-pressed={isSelected}
                  title={isSelected ? "Clique para desmarcar filtro" : `Filtrar demandas de ${user.name}`}
                  className={`w-full text-left flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/60 border-[#004C94] dark:border-blue-500 ring-2 ring-[#004C94]/20 shadow-xs'
                      : 'bg-slate-50 dark:bg-[#1A243B] border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/90 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={user.avatar_url} 
                        alt={user.name}
                        className="w-7 h-7 rounded-full bg-white border border-slate-300 dark:border-slate-700" 
                      />
                      <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                        isSelected ? 'bg-[#004C94] dark:bg-blue-400' : 'bg-[#F7941D]'
                      }`} aria-hidden="true" />
                    </div>
                    <div className="text-xs">
                      <div className={`font-semibold truncate max-w-[110px] ${
                        isSelected ? 'text-[#004C94] dark:text-blue-300 font-bold' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {isLead ? (
                          <span className="text-[#d97706] dark:text-amber-400 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-[#d97706] dark:text-amber-400" aria-hidden="true" /> Tech Lead
                          </span>
                        ) : (
                          <span className="text-[#004C94] dark:text-blue-400 font-medium flex items-center gap-0.5">
                            <Code2 className="w-3 h-3 text-[#004C94] dark:text-blue-400" aria-hidden="true" /> Full Stack
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {user.task_count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono font-bold tabular-nums ${
                        isSelected 
                          ? 'bg-[#004C94] text-white border-[#004C94]' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {user.task_count}
                      </span>
                    )}
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#004C94] dark:bg-blue-400" aria-hidden="true" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Neon Database Health Indicator */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0E1526] text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" aria-hidden="true" /> Neon PostgreSQL
        </span>
        
        {dbStatus.status === 'online' && (
          <span className="font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold tabular-nums">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            Online ({dbStatus.latencyMs}ms)
          </span>
        )}

        {dbStatus.status === 'checking' && (
          <span className="font-mono text-amber-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" aria-hidden="true" />
            Conectando...
          </span>
        )}

        {dbStatus.status === 'offline' && (
          <span className="font-mono text-rose-500 dark:text-rose-400 flex items-center gap-1 font-bold">
            <WifiOff className="w-3 h-3" aria-hidden="true" />
            Offline
          </span>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  isOpen = false,
  onClose,
  projects = [],
  activeProjectId = null,
  onSelectProject,
  onOpenNewProjectModal,
  onEditProjectModal,
  teamUsers = [],
  selectedAssigneeId = null,
  onSelectAssignee,
  onOpenTeamModal,
  isDarkMode = false,
  onToggleDarkMode,
  dbStatus = { status: 'online', latencyMs: 12 }
}) {
  const commonProps = {
    projects,
    activeProjectId,
    onSelectProject,
    onOpenNewProjectModal,
    onEditProjectModal,
    teamUsers,
    selectedAssigneeId,
    onSelectAssignee,
    onOpenTeamModal,
    isDarkMode,
    onToggleDarkMode,
    dbStatus
  };

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 glass-panel border-r border-[#004C94]/15 dark:border-slate-800/80 flex-col justify-between h-full shrink-0 select-none bg-white dark:bg-[#131C31] transition-colors duration-200">
        <SidebarInner {...commonProps} />
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden"
            />

            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] glass-panel border-r border-[#004C94]/15 dark:border-slate-800/80 flex flex-col justify-between h-full select-none bg-white dark:bg-[#131C31] shadow-2xl md:hidden"
            >
              <SidebarInner {...commonProps} isMobile={true} onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
