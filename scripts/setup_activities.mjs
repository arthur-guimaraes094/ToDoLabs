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

async function setupActivities() {
  console.log('Criando tabela activities no Neon PostgreSQL...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        action_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✓ Tabela activities criada com sucesso!');

    // Insere uma atividade inicial se vazia
    const countRes = await sql`SELECT count(*)::int as total FROM activities;`;
    if (countRes[0]?.total === 0) {
      await sql`
        INSERT INTO activities (action_type, description, entity_type, metadata)
        VALUES (
          'SYSTEM_INIT',
          'Quadro ToDoLabs inicializado com sucesso no Neon PostgreSQL',
          'SYSTEM',
          '{"version": "0.1.0"}'::jsonb
        );
      `;
      console.log('✓ Registro inicial inserido!');
    }
  } catch (err) {
    console.error('Erro ao configurar tabela de atividades:', err);
  }
}

setupActivities();
