'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Sparkles } from 'lucide-react';

const SHORTCUTS = [
  { key: 'N', desc: 'Criar nova demanda' },
  { key: 'Ctrl + K', desc: 'Abrir paleta de comandos / busca' },
  { key: '/', desc: 'Focar na barra de busca' },
  { key: 'D', desc: 'Alternar visualização (Leque ↔ Grade)' },
  { key: 'M', desc: 'Alternar tema (Claro ↔ Escuro)' },
  { key: '?', desc: 'Abrir / Fechar este menu de atalhos' },
  { key: 'Esc', desc: 'Fechar qualquer modal aberto' }
];

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.15 }}
          className="bg-white dark:bg-[#131C31] w-full max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl p-5 relative text-slate-800 dark:text-slate-200 pb-safe"
        >
          {/* Mobile Drag Handle */}
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" aria-hidden="true" />
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-[#004C94]/20 flex items-center justify-center text-[#004C94] dark:text-blue-400">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                  Atalhos de Teclado
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Navegue como um desenvolvedor pro</p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar atalhos"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Shortcuts List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 py-2">
            {SHORTCUTS.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-1 text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">{s.desc}</span>
                <kbd className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F7941D]" /> Dica: Pressione <strong className="font-mono text-slate-600 dark:text-slate-300">?</strong> para abrir a qualquer momento
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
