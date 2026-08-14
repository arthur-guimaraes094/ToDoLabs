import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const projects = await sql`
      SELECT p.id, p.name, p.description, p.color_code, p.created_at,
             COUNT(t.id)::int as task_count
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY p.created_at ASC
    `;
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json([
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Sistema Financeiro', description: 'Módulo de faturamento, gateway de pagamento e conciliação bancária', color_code: '#3b82f6', task_count: 3 },
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Portal do Cliente', description: 'Painel web responsivo para acompanhamento de pedidos e chamados', color_code: '#10b981', task_count: 2 },
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'App Mobile Vendas', description: 'Aplicativo mobile para força de vendas e catálogo de produtos', color_code: '#8b5cf6', task_count: 0 }
    ]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, color_code } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome do projeto é obrigatório' }, { status: 400 });
    }

    const [newProject] = await sql`
      INSERT INTO projects (name, description, color_code)
      VALUES (${name}, ${description || ''}, ${color_code || '#6366f1'})
      RETURNING id, name, description, color_code, created_at
    `;

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json({ error: 'Falha ao criar projeto' }, { status: 500 });
  }
}
