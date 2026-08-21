'use client';

import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';

const KANBAN_STATUSES = [
  'IDEIAS_BACKLOG',
  'EM_ANALISE',
  'DESENVOLVENDO',
  'EM_REVISAO',
  'CONCLUIDA',
  'CANCELADA'
];

export default function KanbanBoard({ 
  tasks = [], 
  viewMode = 'fan',
  onEditTask, 
  onDeleteTask, 
  onUpdateTaskStatus,
  onOpenNewTaskModal,
  onCopyTask
}) {
  const [activeDropStatus, setActiveDropStatus] = useState(null);
  const [activeDraggingTaskId, setActiveDraggingTaskId] = useState(null);

  // Descobre qual coluna é a origem do card que está sendo arrastado
  const activeOriginStatus = activeDraggingTaskId
    ? tasks.find((t) => t.id === activeDraggingTaskId)?.status
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 w-full max-w-full">
      {KANBAN_STATUSES.map((statusKey) => {
        const columnTasks = tasks.filter((t) => t.status === statusKey);
        const isOriginColumn = activeOriginStatus === statusKey;
        const isTargetColumn = activeDropStatus === statusKey;

        return (
          <KanbanColumn
            key={statusKey}
            statusKey={statusKey}
            tasks={columnTasks}
            viewMode={viewMode}
            isOriginColumn={isOriginColumn}
            isTargetDrop={isTargetColumn}
            activeDraggingTaskId={activeDraggingTaskId}
            onDragStartCard={(taskId) => setActiveDraggingTaskId(taskId)}
            onDragOverColumn={(status) => {
              setActiveDropStatus((prev) => (prev === status ? prev : status));
            }}
            onDragEndCard={() => {
              setActiveDraggingTaskId(null);
              setActiveDropStatus(null);
            }}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
            onOpenNewTaskModal={onOpenNewTaskModal}
            onCopyTask={onCopyTask}
          />
        );
      })}
    </div>
  );
}
