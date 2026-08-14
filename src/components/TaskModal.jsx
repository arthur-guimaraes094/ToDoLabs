'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Users } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

const PRIORITY_OPTIONS = [
  { value: 'BAIXA', label: '🟢 Baixa' },
  { value: 'MEDIA', label: '🔵 Média' },
  { value: 'ALTA', label: '🟡 Alta' },
  { value: 'URGENTE', label: '🔴 Urgente' }
];

const STATUS_OPTIONS = [
  { value: 'IDEIAS_BACKLOG', label: '💡 Ideias / Backlog' },
  { value: 'EM_ANALISE', label: '🔍 Em Análise' },
  { value: 'DESENVOLVENDO', label: '⚙️ Desenvolvendo' },
  { value: 'EM_REVISAO', label: '👀 Em Revisão' },
  { value: 'CONCLUIDA', label: '✅ Concluída' },
  { value: 'CANCELADA', label: '🚫 Cancelada' }
];

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  taskToEdit = null, 
  initialStatus = 'IDEIAS_BACKLOG',
  projects = [],
  activeProjectId = null,
  teamUsers = []
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('MEDIA');
  const [status, setStatus] = useState('IDEIAS_BACKLOG');
  const [dueDate, setDueDate] = useState('');
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [prUrl, setPrUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal ESC Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setProjectId(taskToEdit.project_id || '');
      setPriority(taskToEdit.priority || 'MEDIA');
      setStatus(taskToEdit.status || 'IDEIAS_BACKLOG');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '');
      
      const ids = Array.isArray(taskToEdit.assignee_ids) && taskToEdit.assignee_ids.length > 0
        ? taskToEdit.assignee_ids
        : (taskToEdit.assigned_to_id ? [taskToEdit.assigned_to_id] : []);
      setAssigneeIds(ids);
      
      setPrUrl(taskToEdit.pr_url || '');
    } else {
      setTitle('');
      setDescription('');
      setProjectId(activeProjectId || (projects[0]?.id || ''));
      setPriority('MEDIA');
      setStatus(initialStatus);
      setDueDate('');
      setAssigneeIds([]);
      setPrUrl('');
    }
  }, [taskToEdit, initialStatus, isOpen, activeProjectId, projects]);

  if (!isOpen) return null;

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name
  }));

  const handleToggleAssignee = (userId) => {
    setAssigneeIds((prev) => 
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: taskToEdit?.id,
        title: title.trim(),
        description: description.trim(),
        project_id: projectId,
        priority,
        status,
        due_date: dueDate || null,
        assignee_ids: assigneeIds,
        assigned_to_id: assigneeIds[0] || null,
        pr_url: prUrl.trim() || null
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 text-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#F7941D]/15 border border-[#F7941D]/30 flex items-center justify-center text-[#d97706]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#004C94] font-heading">
              {taskToEdit ? 'Editar Demanda' : 'Nova Demanda'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">Preencha as informações para registro rápido</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 mb-1">
              Título da Atividade / Ideia *
            </label>
            <input
              id="task-title"
              type="text"
              required
              placeholder="Ex: Integrar webhook do gateway ou Ideia de novo relatório"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004C94] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição ou Detalhes
            </label>
            <textarea
              id="task-desc"
              rows={2}
              placeholder="Descreva o contexto, ideia vinda do WhatsApp ou requisitos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004C94] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Projeto / Sistema *
              </label>
              <CustomSelect
                id="task-project"
                options={projectOptions}
                value={projectId}
                onChange={setProjectId}
                placeholder="Selecione um projeto"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridade
              </label>
              <CustomSelect
                id="task-priority"
                options={PRIORITY_OPTIONS}
                value={priority}
                onChange={setPriority}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Etapa (Status)
              </label>
              <CustomSelect
                id="task-status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prazo Orientativo (Soft Deadline)
              </label>
              <CustomDatePicker
                id="task-duedate"
                value={dueDate}
                onChange={setDueDate}
                placeholder="dd/mm/aaaa"
                position="top"
              />
            </div>
          </div>

          {/* Multi-Assignee Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#004C94]" /> Responsáveis pela Demanda
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {assigneeIds.length} {assigneeIds.length === 1 ? 'selecionado' : 'selecionados'}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto">
              {teamUsers.map((user) => {
                const isSelected = assigneeIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleToggleAssignee(user.id)}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-[#004C94] ring-1 ring-[#004C94]/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={user.avatar_url} 
                        alt={user.name} 
                        className="w-6 h-6 rounded-full bg-white border border-slate-300"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-[#004C94] text-white p-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{user.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="task-prurl" className="block text-xs font-semibold text-slate-700 mb-1">
              Link do PR / Commit (GitHub)
            </label>
            <input
              id="task-prurl"
              type="url"
              placeholder="https://github.com/..."
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#004C94]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F7941D] to-[#e07e0c] hover:from-[#e07e0c] hover:to-[#F7941D] text-slate-950 font-bold text-xs shadow-md shadow-[#F7941D]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Salvando...' : taskToEdit ? 'Salvar Alterações' : 'Criar Demanda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
