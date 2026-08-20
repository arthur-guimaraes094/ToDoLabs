import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Carrega .env.local se existir
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length) {
        process.env[key.trim()] = vals.join('=').trim().replace(/(^"|"$)/g, '');
      }
    }
  }
}

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

const sql = neon(DATABASE_URL);

async function setupTags() {
  console.log('Migrando tabela tasks para suportar tags no Neon PostgreSQL...');
  try {
    await sql`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
    `;
    console.log('✓ Coluna "tags TEXT[] DEFAULT \'{}\'" configurada com sucesso na tabela tasks!');
  } catch (err) {
    console.error('Erro na migration de tags:', err);
  }
}

setupTags();
