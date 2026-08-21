'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Edit3, Trash2, Check, UserPlus } from 'lucide-react';
import CustomSelect from './CustomSelect';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Rodrigo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Camila'
];

const ROLE_OPTIONS = [
  { value: 'FULLSTACK_JR', label: 'Dev Full Stack (Junior)' },
  { value: 'FULLSTACK_PL', label: 'Dev Full Stack (Pleno)' },
  { value: 'LEAD', label: 'Tech Lead / Senior' }
];

function TeamUserForm({ userToEdit, onCancel, onSaveUser }) {
  const [name, setName] = useState(userToEdit?.name || '');
  const [email, setEmail] = useState(userToEdit?.email || '');
  const [role, setRole] = useState(userToEdit?.role || 'FULLSTACK_JR');
  const [avatarUrl, setAvatarUrl] = useState(userToEdit?.avatar_url || AVATAR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveUser({
        id: userToEdit?.id,
        name: name.trim(),
        email: email.trim(),
        role,
        avatar_url: avatarUrl
      });
      onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 animate-in fade-in duration-150">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="user-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nome Completo *
          </label>
          <input
            id="user-name"
            type="text"
            required
            placeholder="Ex: Arthur Soares"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#004C94] dark:focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="user-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            E-mail *
          </label>
          <input
            id="user-email"
            type="email"
            required
            placeholder="arthur@todolabs.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#004C94] dark:focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Função / Papel
          </label>
          <CustomSelect
            id="user-role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={setRole}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Avatar Selecionado
          </label>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#1E293B] p-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="Avatar Escolhido" className="w-7 h-7 rounded-full bg-white border border-slate-300 dark:border-slate-700" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">Avatar selecionado</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Selecione o Avatar do Desenvolvedor:
        </label>
        <div className="grid grid-cols-5 gap-2.5 bg-slate-50 dark:bg-[#1E293B] p-3 rounded-2xl border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto">
          {AVATAR_OPTIONS.map((url, idx) => {
            const isSelected = avatarUrl === url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(url)}
                className={`relative p-1.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isSelected 
                    ? 'border-[#004C94] dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-[#004C94]/30 scale-105' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-[#131C31] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Avatar ${idx + 1}`} className="w-10 h-10 rounded-full bg-white" />
                {isSelected && (
                  <span className="absolute -top-1 -right-1 bg-[#004C94] dark:bg-blue-500 text-white p-0.5 rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          Voltar à Lista
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl bg-[#004C94] dark:bg-blue-600 hover:bg-[#003870] dark:hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : userToEdit ? 'Salvar Dev' : 'Cadastrar Dev'}
        </button>
      </div>
    </form>
  );
}

export default function TeamModal({ 
  isOpen, 
  onClose, 
  teamUsers = [], 
  onSaveUser, 
  onDeleteUser 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

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

  const handleStartNewUser = () => {
    setUserToEdit(null);
    setIsEditing(true);
  };

  const handleStartEditUser = (user) => {
    setUserToEdit(user);
    setIsEditing(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#131C31] w-full max-w-xl rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 relative animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 text-slate-800 dark:text-slate-200 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto pb-safe">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" aria-hidden="true" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#004C94]/15 dark:bg-blue-900/40 border border-[#004C94]/30 dark:border-blue-800 flex items-center justify-center text-[#004C94] dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#004C94] dark:text-white font-heading">Equipe</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gerencie os desenvolvedores da equipe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={handleStartNewUser}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F7941D] to-[#e07e0c] hover:from-[#e07e0c] hover:to-[#F7941D] text-slate-950 font-bold text-xs shadow-sm cursor-pointer transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" /> Novo Dev
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <TeamUserForm
            key={userToEdit?.id || 'new-user'}
            userToEdit={userToEdit}
            onCancel={() => {
              setIsEditing(false);
              setUserToEdit(null);
            }}
            onSaveUser={onSaveUser}
          />
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {teamUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-[#004C94]/40 dark:hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.avatar_url} alt={u.name} className="w-9 h-9 rounded-full bg-white border border-slate-300 dark:border-slate-700" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{u.email} • <span className="font-mono text-[#004C94] dark:text-blue-400 font-semibold">{u.role}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEditUser(u)}
                    title="Editar Dev"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#004C94] dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteUser(u.id)}
                    title="Remover Dev"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
