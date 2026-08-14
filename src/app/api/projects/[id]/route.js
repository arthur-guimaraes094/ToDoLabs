import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { name, description, color_code } = body;

    const [updatedProject] = await sql`
      UPDATE projects
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          color_code = COALESCE(${color_code}, color_code)
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    if (!updatedProject) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json({ error: 'Falha ao atualizar projeto' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'ID do projeto não fornecido' }, { status: 400 });
    }

    await sql`
      DELETE FROM projects WHERE id = ${id}::uuid
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    return NextResponse.json({ error: 'Falha ao excluir projeto' }, { status: 500 });
  }
}
