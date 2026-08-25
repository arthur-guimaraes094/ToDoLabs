import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PRESET_TAGS, getTagStyle } from '../src/lib/tags.js';

describe('Tags System & Cache', () => {
  it('deve retornar cores exatas para tags predefinidas', () => {
    const frontendStyle = getTagStyle('Frontend');
    assert.equal(frontendStyle.dot, '#0284c7');

    const backendStyle = getTagStyle('BACKEND');
    assert.equal(backendStyle.dot, '#9333ea');
  });

  it('deve gerar cor determinística e armazenar em cache para tags customizadas', () => {
    const custom1 = getTagStyle('ArquiteturaCloud');
    const custom2 = getTagStyle('ArquiteturaCloud');

    assert.equal(custom1.name, 'ArquiteturaCloud');
    assert.equal(custom1.color, custom2.color);
    assert.equal(custom1.dot, custom2.dot);
    // Valida que o cache retorna a mesma referência de objeto
    assert.strictEqual(custom1, custom2);
  });

  it('deve retornar fallback se a tag for nula ou vazia', () => {
    const fallback = getTagStyle('');
    assert.equal(fallback.name, PRESET_TAGS[0].name);
  });
});
