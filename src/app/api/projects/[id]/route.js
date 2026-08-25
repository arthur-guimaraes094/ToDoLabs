import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isValidUUID, sanitizeText } from '@/lib/validation';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'ID de projeto inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, color_code } = body;

    const cleanName = name !== undefined ? sanitizeText(name, 120) : undefined;
    const cleanDesc = description !== undefined ? sanitizeText(description, 1000) : undefined;
    const cleanColor = color_code !== undefined ? sanitizeText(color_code, 30) : undefined;

    const [updatedProject] = await sql`
      UPDATE projects
      SET name = COALESCE(${cleanName}, name),
          description = COALESCE(${cleanDesc}, description),
          color_code = COALESCE(${cleanColor}, color_code)
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

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'ID do projeto inválido' }, { status: 400 });
    }

    // Remove tarefas associadas e o projeto de forma atômica (ACID transaction)
    await sql.transaction([
      sql`DELETE FROM tasks WHERE project_id = ${id}::uuid`,
      sql`DELETE FROM projects WHERE id = ${id}::uuid`
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    return NextResponse.json({ error: 'Falha ao excluir projeto' }, { status: 500 });
  }
}
