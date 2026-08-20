// Utilitários de validação e sanitização para as rotas da API

export const VALID_STATUSES = [
  'IDEIAS_BACKLOG',
  'EM_ANALISE',
  'DESENVOLVENDO',
  'EM_REVISAO',
  'CONCLUIDA',
  'CANCELADA'
];

export const VALID_PRIORITIES = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'];

export const VALID_ROLES = ['FULLSTACK_JR', 'FULLSTACK_PL', 'LEAD', 'DEV'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id) {
  return typeof id === 'string' && UUID_REGEX.test(id.trim());
}

export function isValidSafeURL(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeSafeURL(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed === '') return null;
  return isValidSafeURL(trimmed) ? trimmed : null;
}

export function sanitizeText(text, maxLength = 1000) {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
}
