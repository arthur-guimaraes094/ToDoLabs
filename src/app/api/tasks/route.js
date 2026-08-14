import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let tasks;
    if (projectId) {
      tasks = await sql`
        SELECT t.id, t.project_id, t.assigned_to_id, t.assignee_ids, t.title, t.description, 
               t.status, t.priority, t.due_date, t.pr_url, t.created_at, t.updated_at,
               u.name as assignee_name, u.avatar_url as assignee_avatar, u.role as assignee_role,
               p.name as project_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.project_id = ${projectId}::uuid
        ORDER BY t.created_at DESC
      `;
    } else {
      tasks = await sql`
        SELECT t.id, t.project_id, t.assigned_to_id, t.assignee_ids, t.title, t.description, 
               t.status, t.priority, t.due_date, t.pr_url, t.created_at, t.updated_at,
               u.name as assignee_name, u.avatar_url as assignee_avatar, u.role as assignee_role,
               p.name as project_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to_id = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        ORDER BY t.created_at DESC
      `;
    }

    // Fetch all users to map multi-assignees efficiently
    const allUsers = await sql`SELECT id, name, avatar_url, role FROM users`;
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    const enrichedTasks = tasks.map((t) => {
      let assignees = [];
      const ids = Array.isArray(t.assignee_ids) && t.assignee_ids.length > 0 
        ? t.assignee_ids 
        : (t.assigned_to_id ? [t.assigned_to_id] : []);

      assignees = ids
        .map((uid) => usersMap.get(uid))
        .filter(Boolean);

      return {
        ...t,
        assignees,
        // Legacy single assignee fallback
        assignee_name: assignees[0]?.name || t.assignee_name,
        assignee_avatar: assignees[0]?.avatar_url || t.assignee_avatar,
        assignee_role: assignees[0]?.role || t.assignee_role,
        assignee_ids: ids
      };
    });

    return NextResponse.json(enrichedTasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
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
      pr_url 
    } = body;

    if (!project_id || !title) {
      return NextResponse.json({ error: 'Projeto e Título são obrigatórios' }, { status: 400 });
    }

    const taskStatus = status || 'IDEIAS_BACKLOG';
    const taskPriority = priority || 'MEDIA';
    const dueDate = due_date || null;
    const prUrl = pr_url || null;

    // Normaliza os IDs de responsáveis
    let cleanAssigneeIds = Array.isArray(assignee_ids) ? assignee_ids.filter(Boolean) : [];
    if (cleanAssigneeIds.length === 0 && assigned_to_id) {
      cleanAssigneeIds = [assigned_to_id];
    }
    const primaryAssignedId = cleanAssigneeIds[0] || null;

    const [newTask] = await sql`
      INSERT INTO tasks (
        project_id, title, description, status, priority, due_date, assigned_to_id, assignee_ids, pr_url
      ) VALUES (
        ${project_id}::uuid, 
        ${title}, 
        ${description || ''}, 
        ${taskStatus}, 
        ${taskPriority}, 
        ${dueDate}, 
        ${primaryAssignedId ? sql`${primaryAssignedId}::uuid` : null}, 
        ${cleanAssigneeIds.length > 0 ? sql`${cleanAssigneeIds}::uuid[]` : sql`'{}'::uuid[]`}, 
        ${prUrl}
      )
      RETURNING *
    `;

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json({ error: 'Falha ao criar tarefa no servidor' }, { status: 500 });
  }
}
