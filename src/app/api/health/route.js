import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  try {
    // Executa uma consulta leve no Neon PostgreSQL para testar a conexão real
    await sql`SELECT 1 as health`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'online',
      db: 'Neon PostgreSQL',
      latencyMs
    });
  } catch (error) {
    console.error('Falha no Healthcheck do Neon:', error);
    return NextResponse.json({
      status: 'offline',
      db: 'Neon PostgreSQL',
      error: error.message || 'Falha de conexão'
    }, { status: 503 });
  }
}
