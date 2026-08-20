import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isValidUUID, sanitizeText, VALID_ROLES } from '@/lib/validation';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'ID do usuário inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, avatar_url, role } = body;

    const trimmedEmail = email ? sanitizeText(email, 150).toLowerCase() : undefined;
    const trimmedName = name ? sanitizeText(name, 100) : undefined;
    const cleanRole = role ? (VALID_ROLES.includes(role) ? role : undefined) : undefined;
    const cleanAvatar = avatar_url ? sanitizeText(avatar_url, 500) : undefined;

    if (trimmedEmail) {
      if (!trimmedEmail.includes('@')) {
        return NextResponse.json({ error: 'Formato de e-mail inválido' }, { status: 400 });
      }

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
          avatar_url = COALESCE(${cleanAvatar}, avatar_url),
          role = COALESCE(${cleanRole}, role)
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

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'ID do usuário não fornecido ou inválido' }, { status: 400 });
    }

    // Desatribui tarefas associadas e remove o id do array multi-assignee para integridade total
    await sql`
      UPDATE tasks 
      SET assigned_to_id = CASE WHEN assigned_to_id = ${id}::uuid THEN NULL ELSE assigned_to_id END,
          assignee_ids = array_remove(COALESCE(assignee_ids, '{}'::uuid[]), ${id}::uuid)
      WHERE assigned_to_id = ${id}::uuid OR ${id}::uuid = ANY(COALESCE(assignee_ids, '{}'::uuid[]))
    `;

    // Deleta o usuário
    await sql`
      DELETE FROM users WHERE id = ${id}::uuid
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ error: 'Falha ao excluir usuário' }, { status: 500 });
  }
}
