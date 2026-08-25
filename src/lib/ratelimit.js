// Utilitário leve de Rate Limiting em memória (Sliding Window) para proteção de rotas da API
const rateLimitMap = new Map();

/**
 * Limpa entradas expiradas periodicamente para evitar vazamento de memória
 */
function pruneExpiredEntries(now) {
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Extrai o IP do cliente a partir dos cabeçalhos da requisição
 */
export function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Verifica se a requisição atual excede o limite de taxa
 * @param {Request} request 
 * @param {number} maxRequests Limite de requisições na janela (padrão: 60)
 * @param {number} windowMs Janela em milissegundos (padrão: 60.000ms = 1 minuto)
 * @returns {{ allowed: boolean, remaining: number, resetTime: number }}
 */
export function checkRateLimit(request, maxRequests = 60, windowMs = 60000) {
  const now = Date.now();

  // Limpa registros antigos se o mapa crescer
  if (rateLimitMap.size > 500) {
    pruneExpiredEntries(now);
  }

  const ip = getClientIP(request);
  const key = `${ip}`;

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    const newRecord = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitMap.set(key, newRecord);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newRecord.resetTime
    };
  }

  record.count += 1;

  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime
  };
}
