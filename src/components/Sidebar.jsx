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
  Edit3
} from 'lucide-react';

export default function Sidebar({
  projects = [],
  activeProjectId = null,
  onSelectProject,
  onOpenNewProjectModal,
  onEditProjectModal,
  teamUsers = [],
  onOpenTeamModal,
  dbStatus = { status: 'online', latencyMs: 12 }
}) {
  return (
    <aside className="w-64 glass-panel border-r border-[#004C94]/15 flex flex-col justify-between h-full shrink-0 select-none bg-white">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#004C94]/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#004C94] to-[#0266c8] flex items-center justify-center shadow-md shadow-[#004C94]/20 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg text-[#004C94] tracking-tight font-heading">ToDoLabs</h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#F7941D]/20 text-[#d97706] border border-[#F7941D]/40">
                DEV
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F7941D]" /> Projetos & Sistemas
            </span>
            <button
              onClick={onOpenNewProjectModal}
              title="Novo Projeto"
              className="p-1 rounded-lg text-slate-400 hover:text-[#004C94] hover:bg-[#004C94]/10 transition-colors cursor-pointer"
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
                  ? 'bg-gradient-to-r from-[#004C94]/15 to-[#004C94]/5 text-[#004C94] border border-[#004C94]/30 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
                <span>Todos os Projetos</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeProjectId === null ? 'opacity-100' : 'opacity-0'}`} />
            </button>

            {/* List of Projects (Without Button Overlap) */}
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
                        ? 'bg-gradient-to-r from-[#004C94]/15 to-[#004C94]/5 text-[#004C94] border border-[#F7941D]/50 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-[#F7941D] hover:bg-slate-200/80 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </span>
                      {proj.task_count > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#F7941D]" /> Equipe ({teamUsers.length})
            </span>
            <button
              onClick={onOpenTeamModal}
              title="Gerenciar Time"
              className="p-1 rounded-lg text-slate-400 hover:text-[#004C94] hover:bg-[#004C94]/10 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {teamUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img 
                      src={user.avatar_url} 
                      alt={user.name}
                      className="w-7 h-7 rounded-full bg-white border border-slate-300"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#F7941D] ring-2 ring-white" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 truncate max-w-[110px]">{user.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      {user.role === 'LEAD' ? (
                        <span className="text-[#d97706] font-bold flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-[#d97706]" /> Tech Lead
                        </span>
                      ) : (
                        <span className="text-[#004C94] font-medium flex items-center gap-0.5">
                          <Code2 className="w-3 h-3 text-[#004C94]" /> Full Stack
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Neon Database Health Indicator */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-600 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" /> Neon PostgreSQL
        </span>
        
        {dbStatus.status === 'online' && (
          <span className="font-mono text-emerald-600 flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online ({dbStatus.latencyMs}ms)
          </span>
        )}

        {dbStatus.status === 'offline' && (
          <span className="font-mono text-rose-600 flex items-center gap-1 font-bold">
            <WifiOff className="w-3 h-3" />
            Offline
          </span>
        )}

        {dbStatus.status === 'checking' && (
          <span className="font-mono text-[#d97706] animate-pulse">
            Conectando...
          </span>
        )}
      </div>
    </aside>
  );
}
