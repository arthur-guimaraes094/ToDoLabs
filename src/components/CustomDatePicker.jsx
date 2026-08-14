'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function CustomDatePicker({
  id,
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  position = "top", // Default 'top' so it opens upwards inside modals and never cuts off
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial value YYYY-MM-DD
  const parseInitialDate = () => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const [currentMonth, setCurrentMonth] = useState(parseInitialDate());

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      setCurrentMonth(new Date(y, m - 1, d));
    }
  }, [value]);

  // Click outside & ESC listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Format YYYY-MM-DD for display (DD/MM/YYYY)
  const formatDisplayDate = (val) => {
    if (!val) return '';
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  };

  // Calendar Math
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayNumber) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setCurrentMonth(today);
    setIsOpen(false);
  };

  // Selected Date Breakdown
  const selectedY = value ? Number(value.split('-')[0]) : null;
  const selectedM = value ? Number(value.split('-')[1]) - 1 : null;
  const selectedD = value ? Number(value.split('-')[2]) : null;

  const today = new Date();

  // Position classes: 'top' opens above, 'bottom' opens below
  const positionClasses = position === "top"
    ? "bottom-full mb-2 right-0 origin-bottom-right"
    : "top-full mt-2 right-0 origin-top-right";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Date Trigger Input */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 border transition-all rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer text-left shadow-xs ${
          isOpen 
            ? 'border-[#004C94] ring-2 ring-[#004C94]/20 bg-white' 
            : 'border-slate-300 hover:border-[#004C94]/60 hover:bg-white'
        }`}
      >
        <span className={value ? 'text-slate-900 font-mono font-medium' : 'text-slate-400'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 text-[#004C94]">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              title="Limpar data"
              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <CalendarIcon className="w-4 h-4 text-[#004C94]" />
        </div>
      </button>

      {/* Custom Floating Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: position === "top" ? 6 : -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "top" ? 6 : -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute ${positionClasses} z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-64 text-slate-800 select-none`}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-[#004C94] font-heading">
                {MONTH_NAMES[month]} de {year}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {WEEK_DAYS.map((wd, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-400">
                  {wd}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isSelected = selectedY === year && selectedM === month && selectedD === dayNum;
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === dayNum;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-7 w-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#004C94] text-white font-bold shadow-sm'
                        : isToday
                        ? 'border border-[#F7941D] text-[#d97706] font-bold bg-amber-50'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-700 transition-colors font-medium cursor-pointer"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="text-[#004C94] hover:underline font-bold cursor-pointer"
              >
                Hoje
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
