/**
 * Formata o texto de compartilhamento / cópia rápida de uma demanda
 * seguindo o modelo solicitado:
 * *[Titulo]*
 * - [Descricao]
 * [tags](em italico)
 * Prioridade: [Prioridade]
 * Prazo: [Prazo] (se tiver)
 * Etapa: [Etapa]
 * [Responsaveis pela demanda](em italico)(se tiver)
 */

const STATUS_LABELS = {
  IDEIAS_BACKLOG: 'Ideias / Backlog',
  EM_ANALISE: 'Em Análise',
  DESENVOLVENDO: 'Desenvolvendo',
  EM_REVISAO: 'Em Revisão',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada'
};

const PRIORITY_LABELS = {
  URGENTE: 'Urgente',
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa'
};

export function formatTaskShareText(task, teamUsers = []) {
  if (!task) return '';

  const lines = [];

  // *[Titulo]*
  lines.push(`*${task.title || 'Sem título'}*`);

  // - [Descricao]
  if (task.description && task.description.trim()) {
    lines.push(`- ${task.description.trim()}`);
  }

  // [tags](em italico)
  if (Array.isArray(task.tags) && task.tags.length > 0) {
    const formattedTags = task.tags.map((t) => `#${t.replace(/\s+/g, '')}`).join(' ');
    lines.push(`_${formattedTags}_`);
  }

  // Prioridade: [Prioridade]
  const priorityText = PRIORITY_LABELS[task.priority] || task.priority || 'Média';
  lines.push(`Prioridade: ${priorityText}`);

  // Prazo: [Prazo] (se tiver)
  if (task.due_date) {
    const rawDate = task.due_date.split('T')[0];
    const [year, month, day] = rawDate.split('-');
    const formattedDate = (year && month && day) ? `${day}/${month}/${year}` : rawDate;
    lines.push(`Prazo: ${formattedDate}`);
  }

  // Etapa: [Etapa]
  const statusText = STATUS_LABELS[task.status] || task.status || 'Ideias / Backlog';
  lines.push(`Etapa: ${statusText}`);

  // [Responsaveis pela demanda](em italico)(se tiver)
  let assigneeNames = [];
  if (Array.isArray(task.assignees) && task.assignees.length > 0) {
    assigneeNames = task.assignees.map((a) => (typeof a === 'string' ? a : a.name)).filter(Boolean);
  } else if (Array.isArray(task.assignee_ids) && task.assignee_ids.length > 0 && Array.isArray(teamUsers)) {
    assigneeNames = teamUsers
      .filter((u) => task.assignee_ids.includes(u.id))
      .map((u) => u.name)
      .filter(Boolean);
  } else if (task.assigned_to_id && Array.isArray(teamUsers)) {
    const user = teamUsers.find((u) => u.id === task.assigned_to_id);
    if (user?.name) assigneeNames.push(user.name);
  }

  if (assigneeNames.length > 0) {
    lines.push(`_Responsáveis: ${assigneeNames.join(', ')}_`);
  }

  return lines.join('\n');
}
