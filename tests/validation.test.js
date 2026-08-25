import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidUUID,
  isValidSafeURL,
  sanitizeSafeURL,
  sanitizeText,
  VALID_STATUSES,
  VALID_PRIORITIES,
  VALID_ROLES
} from '../src/lib/validation.js';

describe('Validation & Sanitization Layer', () => {
  describe('isValidUUID', () => {
    it('deve validar corretamente UUIDs v4 válidos', () => {
      assert.equal(isValidUUID('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'), true);
      assert.equal(isValidUUID('550e8400-e29b-41d4-a716-446655440000'), true);
    });

    it('deve rejeitar UUIDs malformados ou inválidos', () => {
      assert.equal(isValidUUID('invalid-uuid'), false);
      assert.equal(isValidUUID(''), false);
      assert.equal(isValidUUID(null), false);
      assert.equal(isValidUUID(12345), false);
      assert.equal(isValidUUID('550e8400-e29b-41d4-a716-44665544000Z'), false);
    });
  });

  describe('isValidSafeURL and sanitizeSafeURL', () => {
    it('deve aceitar URLs http e https válidas', () => {
      assert.equal(isValidSafeURL('https://github.com/org/repo/pull/1'), true);
      assert.equal(isValidSafeURL('http://localhost:3000'), true);
      assert.equal(sanitizeSafeURL('  https://github.com/pulls  '), 'https://github.com/pulls');
    });

    it('deve rejeitar e sanitizar esquemas inseguros (javascript:, data:, etc)', () => {
      assert.equal(isValidSafeURL('javascript:alert(1)'), false);
      assert.equal(sanitizeSafeURL('javascript:alert(1)'), null);
      assert.equal(sanitizeSafeURL('data:text/html,<script>alert(1)</script>'), null);
      assert.equal(sanitizeSafeURL(''), null);
      assert.equal(sanitizeSafeURL(null), null);
    });
  });

  describe('sanitizeText', () => {
    it('deve podar espaços em branco e respeitar o maxLength', () => {
      assert.equal(sanitizeText('   Olá Mundo   ', 10), 'Olá Mundo');
      assert.equal(sanitizeText('Texto muito longo para o limite', 5), 'Texto');
    });

    it('deve retornar string vazia para tipos não-string', () => {
      assert.equal(sanitizeText(null), '');
      assert.equal(sanitizeText(undefined), '');
      assert.equal(sanitizeText(123), '');
    });
  });

  describe('Constants Enum', () => {
    it('deve conter todos os status Kanban esperados', () => {
      assert.ok(VALID_STATUSES.includes('IDEIAS_BACKLOG'));
      assert.ok(VALID_STATUSES.includes('EM_ANALISE'));
      assert.ok(VALID_STATUSES.includes('DESENVOLVENDO'));
      assert.ok(VALID_STATUSES.includes('EM_REVISAO'));
      assert.ok(VALID_STATUSES.includes('CONCLUIDA'));
      assert.ok(VALID_STATUSES.includes('CANCELADA'));
    });

    it('deve conter as 4 prioridades', () => {
      assert.deepEqual(VALID_PRIORITIES, ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']);
    });
  });
});
