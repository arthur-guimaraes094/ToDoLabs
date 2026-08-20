'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Users, Tag, Plus } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import { PRESET_TAGS, getTagStyle } from '@/lib/tags';

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

function TaskModalForm({
  taskToEdit,
  initialStatus,
  projects,
  activeProjectId,
  teamUsers,
  onClose,
  onSave
}) {
  const initialAssigneeIds = taskToEdit
    ? (Array.isArray(taskToEdit.assignee_ids) && taskToEdit.assignee_ids.length > 0
        ? taskToEdit.assignee_ids
        : (taskToEdit.assigned_to_id ? [taskToEdit.assigned_to_id] : []))
    : [];

  const initialTags = Array.isArray(taskToEdit?.tags) ? taskToEdit.tags : [];

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [projectId, setProjectId] = useState(taskToEdit?.project_id || activeProjectId || (projects[0]?.id || ''));
  const [priority, setPriority] = useState(taskToEdit?.priority || 'MEDIA');
  const [status, setStatus] = useState(taskToEdit?.status || initialStatus);
  const [dueDate, setDueDate] = useState(taskToEdit?.due_date ? taskToEdit.due_date.split('T')[0] : '');
  const [assigneeIds, setAssigneeIds] = useState(initialAssigneeIds);
  const [tags, setTags] = useState(initialTags);
  const [customTagInput, setCustomTagInput] = useState('');
  const [prUrl, setPrUrl] = useState(taskToEdit?.pr_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name
  }));

  const handleToggleAssignee = (userId) => {
    setAssigneeIds((prev) => 
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleTag = (tagName) => {
    setTags((prev) => 
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleAddCustomTag = (e) => {
    e?.preventDefault();
    const clean = customTagInput.trim();
    if (!clean) return;
    if (!tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setCustomTagInput('');
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
        pr_url: prUrl.trim() || null,
        tags
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
      <div className="bg-white dark:bg-[#131C31] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#F7941D]/15 border border-[#F7941D]/30 flex items-center justify-center text-[#d97706] dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#004C94] dark:text-white font-heading">
              {taskToEdit ? 'Editar Demanda' : 'Nova Demanda'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Preencha as informações para registro rápido</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título da Atividade / Ideia *
            </label>
            <input
              id="task-title"
              type="text"
              required
              placeholder="Ex: Integrar webhook do gateway ou Ideia de novo relatório"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#004C94] dark:focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição ou Detalhes
            </label>
            <textarea
              id="task-desc"
              rows={2}
              placeholder="Descreva o contexto, ideia vinda do WhatsApp ou requisitos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#004C94] dark:focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Tags / Rótulos Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#F7941D]" /> Tags / Rótulos
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
              </span>
            </label>

            {/* Presets Grid */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_TAGS.map((pt) => {
                const isSelected = tags.includes(pt.name);
                return (
                  <button
                    key={pt.name}
                    type="button"
                    onClick={() => handleToggleTag(pt.name)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? `${pt.color} ring-2 ring-[#004C94]/40 font-bold shadow-xs scale-102`
                        : 'bg-slate-50 dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pt.dot }} />
                    <span>{pt.name}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Adicionar outra tag personalizada..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#004C94] dark:focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!customTagInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>

            {/* Active Tags Pills List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 p-2 bg-slate-50/70 dark:bg-[#0E1526]/70 rounded-xl border border-slate-200/60 dark:border-slate-800">
                {tags.map((t) => {
                  const style = getTagStyle(t);
                  return (
                    <span
                      key={t}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${style.color}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleTag(t)}
                        title={`Remover tag ${t}`}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#004C94] dark:text-blue-400" /> Responsáveis pela Demanda
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {assigneeIds.length} {assigneeIds.length === 1 ? 'selecionado' : 'selecionados'}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-[#1E293B] p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto">
              {teamUsers.map((user) => {
                const isSelected = assigneeIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleToggleAssignee(user.id)}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-[#004C94] dark:border-blue-500 ring-1 ring-[#004C94]/30'
                        : 'bg-white dark:bg-[#131C31] border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={user.avatar_url} 
                        alt={user.name} 
                        className="w-6 h-6 rounded-full bg-white border border-slate-300 dark:border-slate-600"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-[#004C94] dark:bg-blue-500 text-white p-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{user.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="task-prurl" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link do PR / Commit (GitHub)
            </label>
            <input
              id="task-prurl"
              type="url"
              placeholder="https://github.com/..."
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#004C94] dark:focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <TaskModalForm
      key={taskToEdit?.id || `new-task-${initialStatus}`}
      taskToEdit={taskToEdit}
      initialStatus={initialStatus}
      projects={projects}
      activeProjectId={activeProjectId}
      teamUsers={teamUsers}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
