import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { sanitizeText } from '@/lib/validation';

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
    return NextResponse.json({ error: 'Falha ao buscar projetos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, color_code } = body;

    const cleanName = sanitizeText(name, 120);
    if (!cleanName) {
      return NextResponse.json({ error: 'Nome do projeto é obrigatório' }, { status: 400 });
    }

    const cleanDesc = sanitizeText(description, 1000);
    const cleanColor = sanitizeText(color_code, 30) || '#004C94';

    const [newProject] = await sql`
      INSERT INTO projects (name, description, color_code)
      VALUES (${cleanName}, ${cleanDesc}, ${cleanColor})
      RETURNING id, name, description, color_code, created_at
    `;

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json({ error: 'Falha ao criar projeto' }, { status: 500 });
  }
}
