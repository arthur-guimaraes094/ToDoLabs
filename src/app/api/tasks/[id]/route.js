import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    const { 
      title, 
      description, 
      status, 
      priority, 
      due_date, 
      assignee_ids, 
      assigned_to_id, 
      pr_url 
    } = body;

    const dueDate = due_date !== undefined ? (due_date || null) : undefined;
    const prUrl = pr_url !== undefined ? (pr_url || null) : undefined;

    let cleanAssigneeIds = undefined;
    let primaryAssignedId = undefined;

    if (assignee_ids !== undefined) {
      cleanAssigneeIds = Array.isArray(assignee_ids) ? assignee_ids.filter(Boolean) : [];
      primaryAssignedId = cleanAssigneeIds[0] || null;
    } else if (assigned_to_id !== undefined) {
      primaryAssignedId = assigned_to_id || null;
      cleanAssigneeIds = primaryAssignedId ? [primaryAssignedId] : [];
    }

    const [updatedTask] = await sql`
      UPDATE tasks
      SET title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          status = COALESCE(${status}, status),
          priority = COALESCE(${priority}, priority),
          due_date = ${dueDate !== undefined ? dueDate : sql`due_date`},
          assigned_to_id = ${primaryAssignedId !== undefined ? (primaryAssignedId ? sql`${primaryAssignedId}::uuid` : null) : sql`assigned_to_id`},
          assignee_ids = ${cleanAssigneeIds !== undefined ? (cleanAssigneeIds.length > 0 ? sql`${cleanAssigneeIds}::uuid[]` : sql`'{}'::uuid[]`) : sql`assignee_ids`},
          pr_url = ${prUrl !== undefined ? prUrl : sql`pr_url`},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    if (!updatedTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return NextResponse.json({ error: 'Falha ao atualizar tarefa' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'ID da tarefa não fornecido' }, { status: 400 });
    }

    await sql`
      DELETE FROM tasks WHERE id = ${id}::uuid
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    return NextResponse.json({ error: 'Falha ao excluir tarefa' }, { status: 500 });
  }
}
