'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const ICONS = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    info: <Info className="w-4 h-4 text-[#004C94] dark:text-blue-400" />
  };

  const BORDER_STYLES = {
    success: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200',
    error: 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200',
    info: 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200'
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-5 right-5 z-50"
        >
          <div className={`px-4 py-3 rounded-2xl border shadow-xl flex items-center gap-3 max-w-sm ${BORDER_STYLES[toast.type || 'success']}`}>
            {ICONS[toast.type || 'success']}
            <span className="text-xs font-bold flex-1">{toast.message}</span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
