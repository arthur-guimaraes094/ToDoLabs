export const PRESET_TAGS = [
  { name: 'Frontend', color: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/80', dot: '#0284c7' },
  { name: 'Backend', color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/80', dot: '#9333ea' },
  { name: 'Bugfix', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/80', dot: '#e11d48' },
  { name: 'Feature', color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/80', dot: '#d97706' },
  { name: 'Database', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/80', dot: '#059669' },
  { name: 'DevOps', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/80', dot: '#004C94' },
  { name: 'Segurança', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800/80', dot: '#dc2626' },
  { name: 'Refactor', color: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800/80', dot: '#0d9488' },
  { name: 'Docs', color: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700', dot: '#64748b' }
];

const FALLBACK_PALETTES = [
  { color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/80', dot: '#6366f1' },
  { color: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950/70 dark:text-pink-300 dark:border-pink-800/80', dot: '#ec4899' },
  { color: 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-950/70 dark:text-lime-300 dark:border-lime-800/80', dot: '#65a30d' },
  { color: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800/80', dot: '#0891b2' }
];

export function getTagStyle(tagName) {
  if (!tagName) return PRESET_TAGS[0];

  const normalized = tagName.trim().toLowerCase();
  const matched = PRESET_TAGS.find((p) => p.name.toLowerCase() === normalized);
  if (matched) return matched;

  // Hash para tags customizadas
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_PALETTES.length;
  return {
    name: tagName,
    ...FALLBACK_PALETTES[index]
  };
}
