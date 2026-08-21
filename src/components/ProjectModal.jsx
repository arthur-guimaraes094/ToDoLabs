'use client';

import React, { useState, useEffect } from 'react';
import { X, Layers, Palette, Trash2 } from 'lucide-react';

const PRESET_COLORS = [
  '#004C94', // Corporate Blue
  '#F7941D', // Vibrant Orange
  '#0284c7', // Sky Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#06b6d4'  // Cyan
];

function ProjectModalForm({ projectToEdit, onClose, onSave, onDelete }) {
  const [name, setName] = useState(projectToEdit?.name || '');
  const [description, setDescription] = useState(projectToEdit?.description || '');
  const [colorCode, setColorCode] = useState(projectToEdit?.color_code || '#004C94');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: projectToEdit?.id,
        name: name.trim(),
        description: description.trim(),
        color_code: colorCode
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToEdit?.id) return;
    setIsSubmitting(true);
    try {
      await onDelete(projectToEdit.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#131C31] w-full max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 relative animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 text-slate-800 dark:text-slate-200 pb-safe">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" aria-hidden="true" />

        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#004C94]/10 dark:bg-blue-900/40 border border-[#004C94]/20 dark:border-blue-800 flex items-center justify-center text-[#004C94] dark:text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#004C94] dark:text-white font-heading">
              {projectToEdit ? 'Editar Projeto' : 'Novo Projeto'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure as informações do sistema ou módulo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Nome do Projeto <span className="text-rose-500">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              required
              placeholder="ex: Sistema Financeiro, Portal do Aluno..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 focus:border-[#004C94] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#004C94]/20 rounded-xl px-3.5 py-2 text-base sm:text-xs font-semibold text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label htmlFor="project-desc" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Descrição
            </label>
            <textarea
              id="project-desc"
              rows={3}
              placeholder="Descreva o escopo e objetivos do sistema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 focus:border-[#004C94] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#004C94]/20 rounded-xl p-3 text-base sm:text-xs font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#F7941D]" /> Cor de Identificação
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorCode(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    colorCode === c ? 'scale-115 ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
            {projectToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#004C94] to-[#0266c8] dark:from-blue-600 dark:to-blue-700 hover:from-[#003c75] hover:to-[#004C94] text-white font-bold text-xs shadow-md shadow-[#004C94]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Projeto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  projectToEdit = null 
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
    <ProjectModalForm
      key={projectToEdit?.id || 'new-project'}
      projectToEdit={projectToEdit}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
}
