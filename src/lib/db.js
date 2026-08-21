import { neon, neonConfig } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Configuração ausente: A variável de ambiente DATABASE_URL não foi definida.');
}

// Sob ambiente corporativo ou desenvolvimento local (fora da nuvem Vercel), desabilita rejeição de proxy SSL
if (!process.env.VERCEL || process.env.NODE_ENV !== 'production' || process.env.ALLOW_INSECURE_TLS === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * fetchFunction Resiliente para contornar instabilidades de rede corporativa e inspeções
 * temporárias de proxy/firewall (ex: FortiGuard WebFilter que retorna 403 transiente enquanto categoriza a URL).
 */
const originalFetch = globalThis.fetch;

async function resilientFetch(url, options) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await originalFetch(url, options);

      // Inspeciona se a resposta é um erro de bloqueio/inspeção transiente de proxy (403 HTML) ou 5xx
      if (response.status === 403 || (response.status >= 502 && response.status <= 504)) {
        const cloned = response.clone();
        const bodyText = await cloned.text();

        const isProxyBlocked =
          bodyText.includes('Web Page Blocked') ||
          bodyText.includes('webfiltering') ||
          bodyText.includes('Web Filter') ||
          bodyText.includes('FortiGuard') ||
          bodyText.includes('Zscaler') ||
          bodyText.includes('Access Denied');

        const isTransient5xx = response.status >= 502 && response.status <= 504;

        if (isProxyBlocked || isTransient5xx) {
          attempt++;
          if (attempt > maxRetries) {
            return response; // Esgotou tentativas, devolve resposta original
          }
          const delay = 150 * Math.pow(2, attempt - 1);
          console.warn(
            `[NeonDB Proxy/Rede Retry ${attempt}/${maxRetries}] Interceptado HTTP ${response.status} (${isProxyBlocked ? 'Filtro/Proxy Corporativo' : 'Gateway Temporário'}). Nova tentativa em ${delay}ms...`
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
      }

      return response;
    } catch (err) {
      attempt++;
      const isFetchFailed =
        err?.name === 'TypeError' ||
        err?.message?.includes('fetch failed') ||
        err?.message?.includes('ECONNRESET') ||
        err?.message?.includes('ETIMEDOUT') ||
        err?.message?.includes('ENOTFOUND') ||
        err?.message?.includes('UND_ERR');

      if (attempt > maxRetries || !isFetchFailed) {
        throw err;
      }

      const delay = 150 * Math.pow(2, attempt - 1);
      console.warn(
        `[NeonDB Rede Retry ${attempt}/${maxRetries}] Falha de conexão transitória ("${err?.message}"). Nova tentativa em ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Configura o driver Neon para usar o fetch resiliente
neonConfig.fetchFunction = resilientFetch;

// Inicializa o cliente serverless Neon com pooling e retry
const sql = neon(databaseUrl);

export default sql;
