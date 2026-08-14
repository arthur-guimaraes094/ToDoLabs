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

export default function TeamModal({ 
  isOpen, 
  onClose, 
  teamUsers = [], 
  onSaveUser, 
  onDeleteUser 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('FULLSTACK_JR');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_OPTIONS[0]);
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
    if (userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setRole(userToEdit.role || 'FULLSTACK_JR');
      setAvatarUrl(userToEdit.avatar_url || AVATAR_OPTIONS[0]);
      setIsEditing(true);
    } else {
      setName('');
      setEmail('');
      setRole('FULLSTACK_JR');
      const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
      setAvatarUrl(randomAvatar);
      setIsEditing(false);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleStartNewUser = () => {
    setUserToEdit(null);
    setName('');
    setEmail('');
    setRole('FULLSTACK_JR');
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
    setAvatarUrl(randomAvatar);
    setIsEditing(true);
  };

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
      setIsEditing(false);
      setUserToEdit(null);
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
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        {/* Header with Title and Actions (No Button Overlap) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#004C94]/15 border border-[#004C94]/30 flex items-center justify-center text-[#004C94]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#004C94] font-heading">Equipe</h3>
              <p className="text-xs text-slate-500 font-medium">Gerencie os desenvolvedores da equipe</p>
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Mode: List or Form */}
        {isEditing ? (
          <form onSubmit={handleFormSubmit} className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="user-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  placeholder="Ex: Arthur Soares"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#004C94]"
                />
              </div>

              <div>
                <label htmlFor="user-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail *
                </label>
                <input
                  id="user-email"
                  type="email"
                  required
                  placeholder="arthur@todolabs.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#004C94]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avatar Selecionado
                </label>
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-300">
                  <img src={avatarUrl} alt="Avatar Escolhido" className="w-7 h-7 rounded-full bg-white border border-slate-300" />
                  <span className="text-xs text-slate-600 font-mono truncate">Avatar selecionado</span>
                </div>
              </div>
            </div>

            {/* Visual Avatar Picker Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Selecione o Avatar do Desenvolvedor:
              </label>
              <div className="grid grid-cols-5 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-40 overflow-y-auto">
                {AVATAR_OPTIONS.map((url, idx) => {
                  const isSelected = avatarUrl === url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`relative p-1.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isSelected 
                          ? 'border-[#004C94] bg-blue-50 ring-2 ring-[#004C94]/30 scale-105' 
                          : 'border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx + 1}`} className="w-10 h-10 rounded-full bg-white" />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-[#004C94] text-white p-0.5 rounded-full">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setUserToEdit(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                Voltar à Lista
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#004C94] hover:bg-[#003870] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                {isSubmitting ? 'Salvando...' : userToEdit ? 'Salvar Dev' : 'Cadastrar Dev'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {teamUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#004C94]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={u.avatar_url} alt={u.name} className="w-9 h-9 rounded-full bg-white border border-slate-300" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email} • <span className="font-mono text-[#004C94] font-semibold">{u.role}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setUserToEdit(u)}
                    title="Editar Dev"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#004C94] hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteUser(u.id)}
                    title="Remover Dev"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
