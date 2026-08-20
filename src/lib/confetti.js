import confetti from 'canvas-confetti';

/**
 * Dispara uma celebração visual com confetes de alta fidelidade
 * com paleta de cores temática SENAC / ToDoLabs.
 */
export function triggerCompletionConfetti() {
  if (typeof window === 'undefined') return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#004C94', '#0266c8', '#F7941D', '#f59e0b', '#10b981', '#38bdf8', '#e11d48']
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  // Sequência de 5 ondas estéticas com físicas variadas
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
