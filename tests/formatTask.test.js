import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTaskShareText } from '../src/lib/formatTask.js';

describe('formatTaskShareText', () => {
  it('deve formatar corretamente uma demanda completa', () => {
    const task = {
      title: 'Implementar Auth SSO',
      description: 'Configurar fluxo de login com NextAuth',
      tags: ['Backend', 'Segurança'],
      priority: 'ALTA',
      due_date: '2026-09-15T00:00:00.000Z',
      status: 'DESENVOLVENDO',
      assignees: [{ name: 'Arthur' }, { name: 'Lucas' }]
    };

    const output = formatTaskShareText(task);

    assert.ok(output.includes('*Implementar Auth SSO*'));
    assert.ok(output.includes('- Configurar fluxo de login com NextAuth'));
    assert.ok(output.includes('_#Backend #Segurança_'));
    assert.ok(output.includes('Prioridade: Alta'));
    assert.ok(output.includes('Prazo: 15/09/2026'));
    assert.ok(output.includes('Etapa: Desenvolvendo'));
    assert.ok(output.includes('_Responsáveis: Arthur, Lucas_'));
  });

  it('deve lidar com dados parciais ou nulos sem falhar', () => {
    assert.equal(formatTaskShareText(null), '');
    const minimal = formatTaskShareText({ title: 'Demanda Simples' });
    assert.ok(minimal.includes('*Demanda Simples*'));
    assert.ok(minimal.includes('Prioridade: Média'));
  });
});
