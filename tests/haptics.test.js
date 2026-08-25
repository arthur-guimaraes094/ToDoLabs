import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { triggerHapticFeedback, HAPTIC_PRESETS } from '../src/lib/haptics.js';

describe('Haptic Feedback Utility', () => {
  it('não deve lançar exceção em ambiente de teste ou navegador sem motor de vibração', () => {
    assert.doesNotThrow(() => {
      triggerHapticFeedback(HAPTIC_PRESETS.LIGHT);
      triggerHapticFeedback(HAPTIC_PRESETS.SUCCESS);
      triggerHapticFeedback(HAPTIC_PRESETS.ERROR);
    });
  });

  it('deve conter os presets esperados', () => {
    assert.deepEqual(HAPTIC_PRESETS.LIGHT, [10]);
    assert.deepEqual(HAPTIC_PRESETS.SUCCESS, [15, 60, 20]);
    assert.deepEqual(HAPTIC_PRESETS.ERROR, [40, 50, 40]);
  });
});
