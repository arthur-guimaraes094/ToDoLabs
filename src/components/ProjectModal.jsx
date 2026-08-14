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

export default function ProjectModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  projectToEdit = null 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorCode, setColorCode] = useState('#004C94');
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
    if (projectToEdit) {
      setName(projectToEdit.name || '');
      setDescription(projectToEdit.description || '');
      setColorCode(projectToEdit.color_code || '#004C94');
    } else {
      setName('');
      setDescription('');
      setColorCode('#004C94');
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

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
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#004C94]/15 border border-[#004C94]/30 flex items-center justify-center text-[#004C94]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#004C94] font-heading">
              {projectToEdit ? 'Editar Projeto' : 'Novo Projeto / Sistema'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {projectToEdit ? 'Altere as informações do projeto' : 'Adicione um novo módulo para organizar as tarefas'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="proj-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Projeto *
            </label>
            <input
              id="proj-name"
              type="text"
              required
              placeholder="Ex: Portal de Vendas ou API do Gateway"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004C94]"
            />
          </div>

          <div>
            <label htmlFor="proj-desc" className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              id="proj-desc"
              rows={2}
              placeholder="Objetivo principal do projeto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#004C94] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#F7941D]" /> Cor de Identificação
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Cor ${c}`}
                  onClick={() => setColorCode(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${colorCode === c ? 'scale-125 ring-2 ring-[#004C94]' : 'hover:scale-110 opacity-80'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {projectToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir Projeto
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#004C94] hover:bg-[#003870] text-white font-bold text-xs shadow-md shadow-[#004C94]/20 cursor-pointer"
              >
                {isSubmitting ? 'Salvando...' : projectToEdit ? 'Salvar Alterações' : 'Criar Projeto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
