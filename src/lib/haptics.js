/**
 * Utilitário seguro para disparo de Haptic Feedback (Vibração Tátil)
 * em dispositivos móveis e navegadores compatíveis (navigator.vibrate).
 */

export function triggerHapticFeedback(pattern = [10]) {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Falha silenciosa em navegadores que bloqueiam ou não possuem motor de vibração
  }
}

export const HAPTIC_PRESETS = {
  LIGHT: [10],
  MEDIUM: [20],
  SUCCESS: [15, 60, 20],
  ERROR: [40, 50, 40],
  DELETE: [30, 40, 20]
};
