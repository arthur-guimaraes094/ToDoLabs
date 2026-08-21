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
    <div className="flex flex-col justify-between h-full w-full">
      {/* Brand Header, Theme Switcher & Close on Mobile */}
      <div className="p-4 border-b border-[#004C94]/15 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#004C94] to-[#0266c8] dark:from-blue-600 dark:to-blue-800 flex items-center justify-center shadow-md shadow-[#004C94]/20 text-white">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base text-[#004C94] dark:text-white tracking-tight font-heading">
                ToDoLabs
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#F7941D]/20 text-[#d97706] dark:text-amber-400 border border-[#F7941D]/40">
                DEV
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Noturno"}
            aria-label={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Noturno"}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            {isDarkMode ? <Sun className="w-4 h-4 stroke-[2.5]" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
          </button>

          {/* Close button for mobile drawer */}
          {isMobile && (
            <button
              onClick={onClose}
              title="Fechar Menu"
              aria-label="Fechar menu lateral"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] focus-visible:outline-none"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Projetos ({projects.length})
            </span>
            <button
              onClick={onOpenNewProjectModal}
              title="Novo Projeto"
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none ${
                activeProjectId === null
                  ? 'bg-[#004C94] text-white shadow-md shadow-[#004C94]/20 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-[#F7941D] shrink-0" aria-hidden="true" />
                <span className="truncate">Todos os Projetos</span>
              </span>
              {activeProjectId === null && (
                <ChevronRight className="w-3.5 h-3.5 opacity-80 shrink-0" aria-hidden="true" />
              )}
            </button>

            {/* Project List */}
            {projects.map((proj) => {
              const isActive = activeProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  className={`group relative flex items-center rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#004C94] text-white shadow-md shadow-[#004C94]/20 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <button
                    onClick={() => onSelectProject(proj.id)}
                    aria-label={`Selecionar projeto ${proj.name}`}
                    aria-pressed={isActive}
                    className="flex-1 flex items-center justify-between px-3 py-2.5 text-xs font-semibold truncate cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none rounded-xl"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                        style={{ backgroundColor: proj.color || '#F7941D' }} 
                        aria-hidden="true"
                      />
                      <span className="truncate">{proj.name}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {proj.task_count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono font-bold tabular-nums ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {proj.task_count}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
                      )}
                    </div>
                  </button>

                  {/* Quick Edit Project Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProjectModal(proj);
                    }}
                    title="Editar Projeto"
                    aria-label={`Editar projeto ${proj.name}`}
                    className={`p-1 mr-1.5 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
                      isActive 
                        ? 'text-white/80 hover:text-white hover:bg-white/20' 
                        : 'text-slate-400 hover:text-[#004C94] dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Members Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Equipe Dev ({teamUsers.length})
            </span>
            <button
              onClick={onOpenTeamModal}
              title="Gerenciar Equipe"
              aria-label="Gerenciar membros da equipe"
              className="p-1 rounded-lg text-slate-400 hover:text-[#004C94] dark:hover:text-blue-400 hover:bg-[#004C94]/10 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              <Users className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-1">
            {teamUsers.map((user) => {
              const isSelected = selectedAssigneeId === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => onSelectAssignee(isSelected ? null : user.id)}
                  aria-label={`Filtrar demandas de ${user.name}`}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-[#004C94] dark:focus-visible:ring-blue-400 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border border-[#004C94]/40 dark:border-blue-500/40 text-[#004C94] dark:text-blue-300 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={user.avatar_url} 
                      alt={`Avatar de ${user.name}`}
                      className="w-5 h-5 rounded-full bg-slate-200 border border-slate-300 dark:border-slate-700 shrink-0" 
                    />
                    <div className="truncate">
                      <p className="truncate font-semibold">{user.name}</p>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                        {user.role === 'tech_lead' ? (
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
