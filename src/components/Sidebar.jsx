'use client';

import React from 'react';
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

export default function Sidebar({
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
  return (
    <aside className="w-64 glass-panel border-r border-[#004C94]/15 dark:border-slate-800/80 flex flex-col justify-between h-full shrink-0 select-none bg-white dark:bg-[#131C31] transition-colors duration-200">
      {/* Brand Header & Theme Switcher */}
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

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Noturno"}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
        >
          {isDarkMode ? <Sun className="w-4 h-4 stroke-[2.5]" /> : <Moon className="w-4 h-4" />}
        </button>
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
              className="p-1 rounded-lg text-slate-400 hover:text-[#004C94] dark:hover:text-blue-400 hover:bg-[#004C94]/10 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {/* All Projects Filter Item */}
            <button
              onClick={() => onSelectProject(null)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeProjectId === null
                  ? 'bg-gradient-to-r from-[#004C94]/15 to-[#004C94]/5 dark:from-blue-600/25 dark:to-blue-900/10 text-[#004C94] dark:text-blue-300 border border-[#004C94]/30 dark:border-blue-500/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
                <span>Todos os Projetos</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeProjectId === null ? 'opacity-100' : 'opacity-0'}`} />
            </button>

            {/* List of Projects */}
            {projects.map((proj) => {
              const isActive = activeProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  className="group relative flex items-center justify-between"
                >
                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#004C94]/15 to-[#004C94]/5 dark:from-blue-600/25 dark:to-blue-900/10 text-[#004C94] dark:text-blue-300 border border-[#F7941D]/50 dark:border-amber-500/40 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                        style={{ backgroundColor: proj.color_code || '#F7941D' }}
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProjectModal(proj);
                        }}
                        title="Editar Projeto"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-[#F7941D] hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </span>
                      {proj.task_count !== undefined && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
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
                <Users className="w-3.5 h-3.5 text-[#F7941D]" /> Equipe ({teamUsers.length})
              </span>
              {selectedAssigneeId && (
                <button
                  onClick={() => onSelectAssignee && onSelectAssignee(null)}
                  title="Limpar filtro de dev"
                  className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" /> Limpar
                </button>
              )}
            </div>
            <button
              onClick={onOpenTeamModal}
              title="Gerenciar Time"
              className="p-1 rounded-lg text-slate-400 hover:text-[#004C94] dark:hover:text-blue-400 hover:bg-[#004C94]/10 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {teamUsers.map((user) => {
              const isSelected = selectedAssigneeId === user.id;

              return (
                <div 
                  key={user.id} 
                  onClick={() => onSelectAssignee && onSelectAssignee(isSelected ? null : user.id)}
                  title={isSelected ? "Clique para desmarcar filtro" : `Filtrar demandas de ${user.name}`}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
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
                      }`} />
                    </div>
                    <div className="text-xs">
                      <div className={`font-semibold truncate max-w-[110px] ${
                        isSelected ? 'text-[#004C94] dark:text-blue-300 font-bold' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {user.role === 'LEAD' ? (
                          <span className="text-[#d97706] dark:text-amber-400 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-[#d97706] dark:text-amber-400" /> Tech Lead
                          </span>
                        ) : (
                          <span className="text-[#004C94] dark:text-blue-400 font-medium flex items-center gap-0.5">
                            <Code2 className="w-3 h-3 text-[#004C94] dark:text-blue-400" /> Full Stack
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#004C94] dark:bg-blue-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time Neon Database Health Indicator */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0E1526] text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" /> Neon PostgreSQL
        </span>
        
        {dbStatus.status === 'online' && (
          <span className="font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online ({dbStatus.latencyMs}ms)
          </span>
        )}

        {dbStatus.status === 'checking' && (
          <span className="font-mono text-amber-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Conectando...
          </span>
        )}

        {dbStatus.status === 'offline' && (
          <span className="font-mono text-rose-500 dark:text-rose-400 flex items-center gap-1 font-bold">
            <WifiOff className="w-3 h-3" />
            Offline
          </span>
        )}
      </div>
    </aside>
  );
}
