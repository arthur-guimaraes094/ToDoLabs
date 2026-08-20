import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { 
  isValidUUID, 
  sanitizeSafeURL, 
  sanitizeText, 
  VALID_STATUSES, 
  VALID_PRIORITIES 
} from '@/lib/validation';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'ID de tarefa inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      status, 
      priority, 
      due_date, 
      assignee_ids, 
      assigned_to_id, 
      pr_url,
      tags
    } = body;

    const cleanTitle = title !== undefined ? sanitizeText(title, 250) : undefined;
    const cleanDesc = description !== undefined ? sanitizeText(description, 3000) : undefined;
    const cleanStatus = status !== undefined ? (VALID_STATUSES.includes(status) ? status : undefined) : undefined;
    const cleanPriority = priority !== undefined ? (VALID_PRIORITIES.includes(priority) ? priority : undefined) : undefined;
    const dueDate = due_date !== undefined ? (due_date ? new Date(due_date).toISOString() : null) : undefined;
    const prUrl = pr_url !== undefined ? (pr_url ? sanitizeSafeURL(pr_url) : null) : undefined;

    let cleanAssigneeIds = undefined;
    let primaryAssignedId = undefined;

    if (assignee_ids !== undefined) {
      cleanAssigneeIds = Array.isArray(assignee_ids) ? assignee_ids.filter(isValidUUID) : [];
      primaryAssignedId = cleanAssigneeIds[0] || null;
    } else if (assigned_to_id !== undefined) {
      primaryAssignedId = (assigned_to_id && isValidUUID(assigned_to_id)) ? assigned_to_id : null;
      cleanAssigneeIds = primaryAssignedId ? [primaryAssignedId] : [];
    }

    let cleanTags = undefined;
    if (tags !== undefined) {
      cleanTags = Array.isArray(tags) ? tags.map((t) => sanitizeText(t, 40)).filter(Boolean) : [];
    }

    const [updatedTask] = await sql`
      UPDATE tasks
      SET title = COALESCE(${cleanTitle}, title),
          description = COALESCE(${cleanDesc}, description),
          status = COALESCE(${cleanStatus}, status),
          priority = COALESCE(${cleanPriority}, priority),
          due_date = ${dueDate !== undefined ? dueDate : sql`due_date`},
          assigned_to_id = ${primaryAssignedId !== undefined ? (primaryAssignedId ? sql`${primaryAssignedId}::uuid` : null) : sql`assigned_to_id`},
          assignee_ids = ${cleanAssigneeIds !== undefined ? (cleanAssigneeIds.length > 0 ? sql`${cleanAssigneeIds}::uuid[]` : sql`'{}'::uuid[]`) : sql`assignee_ids`},
          pr_url = ${prUrl !== undefined ? prUrl : sql`pr_url`},
          tags = ${cleanTags !== undefined ? (cleanTags.length > 0 ? sql`${cleanTags}::text[]` : sql`'{}'::text[]`) : sql`tags`},
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

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'ID da tarefa inválido' }, { status: 400 });
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
