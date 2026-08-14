'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';
import ProjectModal from '@/components/ProjectModal';
import TeamModal from '@/components/TeamModal';
import ConfirmModal from '@/components/ConfirmModal';
import CommandPalette from '@/components/CommandPalette';
import Toast from '@/components/Toast';
import { Loader2 } from 'lucide-react';

const PRIORITY_WEIGHTS = {
  URGENTE: 4,
  ALTA: 3,
  MEDIA: 2,
  BAIXA: 1
};

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [isLoading, setIsLoading] = useState(true);
  
  // Real DB Health Status
  const [dbStatus, setDbStatus] = useState({ status: 'checking', latencyMs: 0 });

  // Toast State
  const [toast, setToast] = useState(null);

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [initialTaskStatus, setInitialTaskStatus] = useState('IDEIAS_BACKLOG');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const askConfirmation = (title, message, onConfirm) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  };

  // Initial Data Fetching & Health Polling
  useEffect(() => {
    fetchInitialData();
    checkHealth();

    const healthInterval = setInterval(checkHealth, 15000);
    return () => clearInterval(healthInterval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setDbStatus({ status: 'online', latencyMs: data.latencyMs || 10 });
      } else {
        setDbStatus({ status: 'offline', latencyMs: 0 });
      }
    } catch {
      setDbStatus({ status: 'offline', latencyMs: 0 });
    }
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, projectsRes, tasksRes] = await Promise.all([
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json())
      ]);

      setTeamUsers(usersRes || []);
      setProjects(projectsRes || []);
      setTasks(tasksRes || []);
    } catch (err) {
      console.error('Erro ao carregar dados do Neon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload helpers
  const reloadTasks = async () => {
    try {
      const url = activeProjectId ? `/api/tasks?project_id=${activeProjectId}` : '/api/tasks';
      const res = await fetch(url);
      const data = await res.json();
      setTasks(data || []);
    } catch (err) {
      console.error('Erro ao recarregar tarefas:', err);
    }
  };

  const reloadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data || []);
    } catch (err) {
      console.error('Erro ao recarregar projetos:', err);
    }
  };

  const reloadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setTeamUsers(data || []);
    } catch (err) {
      console.error('Erro ao recarregar time:', err);
    }
  };

  // --- Task CRUD ---
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    // Evita disparar requisição e toast se a demanda já estiver na mesma coluna
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === newStatus) {
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const STATUS_LABELS = {
      IDEIAS_BACKLOG: 'Ideias / Backlog',
      EM_ANALISE: 'Em Análise',
      DESENVOLVENDO: 'Desenvolvendo',
      EM_REVISAO: 'Em Revisão',
      CONCLUIDA: 'Concluída',
      CANCELADA: 'Cancelada'
    };

    showToast(`✓ Demanda movida para ${STATUS_LABELS[newStatus] || newStatus}`, 'success');

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao atualizar status da tarefa');
      }
      reloadProjects();
      checkHealth();
    } catch (err) {
      console.error('Erro ao mover tarefa:', err);
      showToast(err.message || 'Erro ao atualizar status da tarefa', 'error');
      reloadTasks();
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        const res = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar demanda');
        showToast('✓ Demanda atualizada com sucesso', 'success');
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao registrar demanda');
        showToast('✓ Nova demanda registrada com sucesso', 'success');
      }
      reloadTasks();
      reloadProjects();
      checkHealth();
    } catch (err) {
      console.error('Erro ao salvar demanda:', err);
      showToast(err.message || 'Erro ao salvar demanda', 'error');
      throw err;
    }
  };

  const handleDeleteTask = (taskId) => {
    askConfirmation(
      'Excluir Demanda',
      'Tem certeza que deseja excluir esta demanda permanentemente?',
      async () => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        try {
          const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Erro ao remover demanda');
          }
          reloadProjects();
          checkHealth();
          showToast('✓ Demanda removida com sucesso', 'info');
        } catch (err) {
          console.error('Erro ao deletar tarefa:', err);
          showToast(err.message || 'Erro ao remover demanda', 'error');
          reloadTasks();
        }
      }
    );
  };

  // --- Project CRUD ---
  const handleOpenNewProjectModal = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProjectModal = (proj) => {
    setProjectToEdit(proj);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (projectData.id) {
        const res = await fetch(`/api/projects/${projectData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar projeto');
        showToast('✓ Projeto atualizado com sucesso', 'success');
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
        const newProj = await res.json();
        if (!res.ok) throw new Error(newProj.error || 'Erro ao criar projeto');
        if (newProj.id) {
          setActiveProjectId(newProj.id);
        }
        showToast('✓ Novo projeto criado com sucesso', 'success');
      }
      reloadProjects();
      checkHealth();
    } catch (err) {
      console.error('Erro ao salvar projeto:', err);
      showToast(err.message || 'Erro ao salvar projeto', 'error');
      throw err;
    }
  };

  const handleDeleteProject = (projectId) => {
    const proj = projects.find((p) => p.id === projectId);
    askConfirmation(
      `Excluir Projeto "${proj?.name || ''}"`,
      'Atenção: todas as demandas associadas a este projeto também serão excluídas.',
      async () => {
        try {
          const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Erro ao excluir projeto');
          }
          if (activeProjectId === projectId) {
            setActiveProjectId(null);
          }
          reloadProjects();
          reloadTasks();
          checkHealth();
          showToast('✓ Projeto excluído com sucesso', 'info');
        } catch (err) {
          console.error('Erro ao excluir projeto:', err);
          showToast(err.message || 'Erro ao excluir projeto', 'error');
        }
      }
    );
  };

  // --- User / Team CRUD ---
  const handleSaveUser = async (userData) => {
    try {
      if (userData.id) {
        const res = await fetch(`/api/users/${userData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao atualizar dados do desenvolvedor');
        }
        showToast('✓ Dados do desenvolvedor atualizados', 'success');
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erro ao cadastrar desenvolvedor');
        }
        showToast('✓ Novo desenvolvedor cadastrado', 'success');
      }
      reloadUsers();
      reloadTasks();
      checkHealth();
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      showToast(err.message || 'Erro ao salvar desenvolvedor', 'error');
      throw err;
    }
  };

  const handleDeleteUser = (userId) => {
    const user = teamUsers.find((u) => u.id === userId);
    askConfirmation(
      `Remover "${user?.name || 'Dev'}" do Time`,
      'O desenvolvedor será removido da equipe e suas tarefas associadas ficarão sem atribuição.',
      async () => {
        try {
          const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Erro ao remover desenvolvedor');
          }
          reloadUsers();
          reloadTasks();
          checkHealth();
          showToast('✓ Desenvolvedor removido do time', 'info');
        } catch (err) {
          console.error('Erro ao excluir usuário:', err);
          showToast(err.message || 'Erro ao remover desenvolvedor', 'error');
        }
      }
    );
  };

  // Open Modals
  const handleOpenNewTaskModal = (status = 'IDEIAS_BACKLOG') => {
    setTaskToEdit(null);
    setInitialTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Filter & Sort Tasks
  let filteredTasks = tasks.filter((t) => {
    const matchesProject = activeProjectId ? t.project_id === activeProjectId : true;
    const matchesSearch = searchTerm.trim() === '' || 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = selectedPriority === 'ALL' ? true : t.priority === selectedPriority;
    
    return matchesProject && matchesSearch && matchesPriority;
  });

  // Dynamic Sorting
  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'PRIORITY_DESC') {
      const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
      const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
      return weightB - weightA;
    }
    if (sortBy === 'PRIORITY_ASC') {
      const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
      const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
      return weightA - weightB;
    }
    if (sortBy === 'DUE_DATE_ASC') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    }
    if (sortBy === 'DUE_DATE_DESC') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(b.due_date) - new Date(a.due_date);
    }
    // Default: Created at DESC
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Stats (computed from active project scope)
  const projectTasks = tasks.filter((t) => (activeProjectId ? t.project_id === activeProjectId : true));
  const taskStats = {
    total: projectTasks.length,
    pending: projectTasks.filter((t) => ['IDEIAS_BACKLOG', 'EM_ANALISE', 'DESENVOLVENDO'].includes(t.status)).length,
    review: projectTasks.filter((t) => t.status === 'EM_REVISAO').length,
    done: projectTasks.filter((t) => t.status === 'CONCLUIDA').length
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onOpenNewProjectModal={handleOpenNewProjectModal}
        onEditProjectModal={handleOpenEditProjectModal}
        teamUsers={teamUsers}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <Header
          activeProject={activeProject}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenNewTaskModal={handleOpenNewTaskModal}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          taskStats={taskStats}
        />

        {/* Loading Spinner or Kanban Board */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#004C94]" />
            <span className="text-xs font-mono">Conectando ao Neon PostgreSQL...</span>
          </div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onOpenNewTaskModal={handleOpenNewTaskModal}
          />
        )}
      </div>

      {/* Modais Customizados SENAC */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        initialStatus={initialTaskStatus}
        projects={projects}
        activeProjectId={activeProjectId}
        teamUsers={teamUsers}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        projectToEdit={projectToEdit}
      />

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teamUsers={teamUsers}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        projects={projects}
        tasks={tasks}
        onSelectProject={(id) => setActiveProjectId(id)}
        onOpenNewTaskModal={handleOpenNewTaskModal}
        onOpenNewProjectModal={handleOpenNewProjectModal}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onEditTask={handleEditTask}
      />

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
