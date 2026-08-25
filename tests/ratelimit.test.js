import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../src/lib/ratelimit.js';

describe('Rate Limiting System', () => {
  it('deve permitir requisições dentro do limite', () => {
    const fakeRequest = {
      headers: new Headers({ 'x-forwarded-for': '192.168.1.100' })
    };

    const res1 = checkRateLimit(fakeRequest, 5, 10000);
    assert.equal(res1.allowed, true);
    assert.equal(res1.remaining, 4);

    const res2 = checkRateLimit(fakeRequest, 5, 10000);
    assert.equal(res2.allowed, true);
    assert.equal(res2.remaining, 3);
  });

  it('deve bloquear quando o limite for excedido', () => {
    const fakeRequest = {
      headers: new Headers({ 'x-forwarded-for': '192.168.1.200' })
    };

    for (let i = 0; i < 3; i++) {
      checkRateLimit(fakeRequest, 3, 10000);
    }

    const blocked = checkRateLimit(fakeRequest, 3, 10000);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
  });
});
