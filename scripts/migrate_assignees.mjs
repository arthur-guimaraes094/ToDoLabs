import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required to run migration.');
}
const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('Iniciando migração no Neon PostgreSQL...');
  try {
    // 1. Adiciona coluna assignee_ids uuid[] se não existir
    await sql`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_ids uuid[] DEFAULT '{}';
    `;
    console.log('✓ Coluna assignee_ids adicionada com sucesso!');

    // 2. Preenche assignee_ids para tarefas que possuem assigned_to_id
    await sql`
      UPDATE tasks 
      SET assignee_ids = ARRAY[assigned_to_id] 
      WHERE assigned_to_id IS NOT NULL AND (assignee_ids IS NULL OR cardinality(assignee_ids) = 0);
    `;
    console.log('✓ Tarefas existentes migradas para o array de responsáveis!');

    const sample = await sql`SELECT id, title, assigned_to_id, assignee_ids FROM tasks LIMIT 5;`;
    console.log('Amostra de tarefas:', sample);
  } catch (err) {
    console.error('Erro na migração:', err);
  }
}

runMigration();
