import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { 
  isValidUUID, 
  sanitizeSafeURL, 
  sanitizeText, 
  VALID_STATUSES, 
  VALID_PRIORITIES 
} from '@/lib/validation';
import { checkRateLimit } from '@/lib/ratelimit';

export async function GET(request) {

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (projectId && !isValidUUID(projectId)) {
      return NextResponse.json({ error: 'project_id inválido' }, { status: 400 });
    }

    // Consulta otimizada com agregação direta dos desenvolvedores em PostgreSQL JSON e tags
    const tasks = await sql`
      SELECT 
        t.id, 
        t.project_id, 
        t.assigned_to_id, 
        t.assignee_ids, 
        t.title, 
        t.description, 
        t.status, 
        t.priority, 
        t.due_date, 
        t.pr_url, 
        COALESCE(t.tags, '{}'::text[]) as tags,
        t.created_at, 
        t.updated_at,
        p.name as project_name,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', u.id,
                'name', u.name,
                'avatar_url', u.avatar_url,
                'role', u.role
              ) ORDER BY array_position(
                CASE 
                  WHEN t.assignee_ids IS NOT NULL AND cardinality(t.assignee_ids) > 0 THEN t.assignee_ids 
                  ELSE ARRAY[t.assigned_to_id] 
                END, 
                u.id
              )
            )
            FROM users u
            WHERE u.id = ANY(
              CASE 
                WHEN t.assignee_ids IS NOT NULL AND cardinality(t.assignee_ids) > 0 THEN t.assignee_ids
                WHEN t.assigned_to_id IS NOT NULL THEN ARRAY[t.assigned_to_id]
                ELSE '{}'::uuid[]
              END
            )
          ),
          '[]'::json
        ) as assignees
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      ${projectId ? sql`WHERE t.project_id = ${projectId}::uuid` : sql``}
      ORDER BY t.created_at DESC
    `;

    // Normaliza compatibilidade para campos legados se necessário
    const enrichedTasks = tasks.map((t) => {
      const assignees = Array.isArray(t.assignees) ? t.assignees : [];
      const tags = Array.isArray(t.tags) ? t.tags : [];
      return {
        ...t,
        assignees,
        tags,
        assignee_name: assignees[0]?.name || null,
        assignee_avatar: assignees[0]?.avatar_url || null,
        assignee_role: assignees[0]?.role || null,
        assignee_ids: Array.isArray(t.assignee_ids) ? t.assignee_ids : (t.assigned_to_id ? [t.assigned_to_id] : [])
      };
    });

    return NextResponse.json(enrichedTasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return NextResponse.json({ error: 'Falha ao consultar tarefas' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(request, 60, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições. Por favor, aguarde alguns instantes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      project_id, 
      title, 
      description, 
      status, 
      priority, 
      due_date, 
      assignee_ids = [], 
      assigned_to_id, 
      pr_url,
      tags = []
    } = body;

    const cleanTitle = sanitizeText(title, 250);
    if (!project_id || !isValidUUID(project_id)) {
      return NextResponse.json({ error: 'ID do projeto válido é obrigatório' }, { status: 400 });
    }
    if (!cleanTitle) {
      return NextResponse.json({ error: 'Título da tarefa é obrigatório' }, { status: 400 });
    }

    const taskStatus = VALID_STATUSES.includes(status) ? status : 'IDEIAS_BACKLOG';
    const taskPriority = VALID_PRIORITIES.includes(priority) ? priority : 'MEDIA';
    const cleanDesc = description ? sanitizeText(description, 3000) : '';
    const safePrUrl = sanitizeSafeURL(pr_url);
    const dueDate = due_date ? new Date(due_date).toISOString() : null;

    // Normaliza e valida os IDs de responsáveis
    let cleanAssigneeIds = Array.isArray(assignee_ids) ? assignee_ids.filter(isValidUUID) : [];
    if (cleanAssigneeIds.length === 0 && assigned_to_id && isValidUUID(assigned_to_id)) {
      cleanAssigneeIds = [assigned_to_id];
    }
    const primaryAssignedId = cleanAssigneeIds[0] || null;

    // Normaliza e limpa as tags
    const cleanTags = Array.isArray(tags) 
      ? tags.map((t) => sanitizeText(t, 40)).filter(Boolean)
      : [];

    const [newTask] = await sql`
      INSERT INTO tasks (
        project_id, title, description, status, priority, due_date, assigned_to_id, assignee_ids, pr_url, tags
      ) VALUES (
        ${project_id}::uuid, 
        ${cleanTitle}, 
        ${cleanDesc}, 
        ${taskStatus}, 
        ${taskPriority}, 
        ${dueDate}, 
        ${primaryAssignedId ? sql`${primaryAssignedId}::uuid` : null}, 
        ${cleanAssigneeIds.length > 0 ? sql`${cleanAssigneeIds}::uuid[]` : sql`'{}'::uuid[]`}, 
        ${safePrUrl},
        ${cleanTags.length > 0 ? sql`${cleanTags}::text[]` : sql`'{}'::text[]`}
      )
      RETURNING *
    `;

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json({ error: 'Falha ao criar tarefa no servidor' }, { status: 500 });
  }
}
