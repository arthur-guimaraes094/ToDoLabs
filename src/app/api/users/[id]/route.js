import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { name, email, avatar_url, role } = body;

    const trimmedEmail = email ? email.trim().toLowerCase() : null;
    const trimmedName = name ? name.trim() : null;

    if (trimmedEmail) {
      const [existing] = await sql`
        SELECT id, name FROM users 
        WHERE LOWER(email) = ${trimmedEmail} AND id != ${id}::uuid
      `;
      if (existing) {
        return NextResponse.json(
          { error: `O e-mail "${trimmedEmail}" já está em uso por ${existing.name}.` }, 
          { status: 409 }
        );
      }
    }

    const [updatedUser] = await sql`
      UPDATE users
      SET name = COALESCE(${trimmedName}, name),
          email = COALESCE(${trimmedEmail}, email),
          avatar_url = COALESCE(${avatar_url}, avatar_url),
          role = COALESCE(${role}, role)
      WHERE id = ${id}::uuid
      RETURNING id, name, email, avatar_url, role
    `;

    if (!updatedUser) {
      return NextResponse.json({ error: 'Desenvolvedor não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Este e-mail já está em uso por outro desenvolvedor.' }, 
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Falha ao atualizar desenvolvedor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    // Primeiro desatribui tarefas associadas para não violar chaves
    await sql`
      UPDATE tasks SET assigned_to_id = NULL WHERE assigned_to_id = ${id}::uuid
    `;

    // Depois deleta o usuário
    await sql`
      DELETE FROM users WHERE id = ${id}::uuid
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ error: 'Falha ao excluir usuário' }, { status: 500 });
  }
}
