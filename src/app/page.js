'use client';

import React, { useState, useEffect, useCallback, useMemo, useDeferredValue, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import KanbanBoard from '@/components/KanbanBoard';
import KanbanSkeleton from '@/components/KanbanSkeleton';
import Toast from '@/components/Toast';
import { triggerCompletionConfetti } from '@/lib/confetti';

// Dynamic code-splitting para modais e painéis pesados (Vercel bundle optimization)
const TaskModal = dynamic(() => import('@/components/TaskModal'), { ssr: false });
const ProjectModal = dynamic(() => import('@/components/ProjectModal'), { ssr: false });
const TeamModal = dynamic(() => import('@/components/TeamModal'), { ssr: false });
const ConfirmModal = dynamic(() => import('@/components/ConfirmModal'), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/CommandPalette'), { ssr: false });
const ActivityDrawer = dynamic(() => import('@/components/ActivityDrawer'), { ssr: false });

const PRIORITY_WEIGHTS = {
  URGENTE: 4,
  ALTA: 3,
  MEDIA: 2,
  BAIXA: 1
};

function getThemeSnapshot() {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('todolabs_theme');
  if (saved) return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeTheme(callback) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    media.removeEventListener('change', callback);
  };
}

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [viewMode, setViewMode] = useState('fan'); // 'fan' (leque) ou 'grid' (grade)
  const [isLoading, setIsLoading] = useState(true);
  
  // React 19 external store for theme
  const currentTheme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => 'light');
  const isDarkMode = currentTheme === 'dark';

  // Real DB Health Status
  const [dbStatus, setDbStatus] = useState({ status: 'checking', latencyMs: 0 });

  // Activities Log State
  const [activities, setActivities] = useState([]);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

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

  // Sync class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    localStorage.setItem('todolabs_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('storage'));
  };

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

  const fetchActivities = useCallback(async () => {
    setIsLoadingActivities(true);
    try {
      const res = await fetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        setActivities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao carregar log de atividades:', err);
    } finally {
      setIsLoadingActivities(false);
    }
  }, []);

  const logActivity = async (action_type, description, entity_type = 'TASK', entity_id = null, metadata = {}) => {
    try {
      const tempId = `temp-${Date.now()}`;
      setActivities((prev) => [
        {
          id: tempId,
          action_type,
          description,
          entity_type,
          entity_id,
          metadata,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);

      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type,
          description,
          entity_type,
          entity_id,
          metadata
        })
      });
    } catch (err) {
      console.error('Erro ao registrar atividade:', err);
    }
  };

  // Initial Data Fetching & Health Polling
  useEffect(() => {
    let isSubscribed = true;

    async function pingHealth() {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch('/api/health');
        if (res.ok && isSubscribed) {
          const data = await res.json();
          setDbStatus({ status: 'online', latencyMs: data.latencyMs || 10 });
        } else if (isSubscribed) {
          setDbStatus({ status: 'offline', latencyMs: 0 });
        }
      } catch {
        if (isSubscribed) setDbStatus({ status: 'offline', latencyMs: 0 });
      }
    }

    async function loadData() {
      try {
        const [usersRes, projectsRes, tasksRes, activitiesRes] = await Promise.all([
          fetch('/api/users').then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch('/api/projects').then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch('/api/tasks').then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch('/api/activities').then((r) => (r.ok ? r.json() : [])).catch(() => [])
        ]);

        if (isSubscribed) {
          setTeamUsers(Array.isArray(usersRes) ? usersRes : []);
          setProjects(Array.isArray(projectsRes) ? projectsRes : []);
          setTasks(Array.isArray(tasksRes) ? tasksRes : []);
          setActivities(Array.isArray(activitiesRes) ? activitiesRes : []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do Neon:', err);
        if (isSubscribed) {
          setTeamUsers([]);
          setProjects([]);
          setTasks([]);
          setActivities([]);
          setIsLoading(false);
        }
      }
    }

    loadData();
    pingHealth();

    const healthInterval = setInterval(pingHealth, 45000);
    return () => {
      isSubscribed = false;
      clearInterval(healthInterval);
    };
  }, []);

  // Reload helpers
  const reloadTasks = async () => {
    try {
      const url = activeProjectId ? `/api/tasks?project_id=${activeProjectId}` : '/api/tasks';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao recarregar tarefas:', err);
    }
  };

  const reloadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao recarregar projetos:', err);
    }
  };

  const reloadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setTeamUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao recarregar time:', err);
    }
  };

  // --- Task CRUD ---
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
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

    const statusLabel = STATUS_LABELS[newStatus] || newStatus;
    showToast(`✓ Demanda movida para ${statusLabel}`, 'success');

    // Se a demanda foi concluída, dispara o efeito de confetes comemorativos!
    if (newStatus === 'CONCLUIDA') {
      triggerCompletionConfetti();
    }

    logActivity(
      'TASK_MOVED',
      `Demanda "${currentTask.title}" movida para ${statusLabel}`,
      'TASK',
      taskId,
      { oldStatus: currentTask.status, newStatus }
    );

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
        const oldTask = tasks.find((t) => t.id === taskData.id);
        const res = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar demanda');
        showToast('✓ Demanda atualizada com sucesso', 'success');

        if (taskData.status === 'CONCLUIDA' && oldTask?.status !== 'CONCLUIDA') {
          triggerCompletionConfetti();
        }

        logActivity(
          'TASK_UPDATED',
          `Demanda "${taskData.title}" atualizada`,
          'TASK',
          taskData.id
        );
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao registrar demanda');
        showToast('✓ Nova demanda registrada com sucesso', 'success');

        if (taskData.status === 'CONCLUIDA') {
          triggerCompletionConfetti();
        }

        logActivity(
          'TASK_CREATED',
          `Nova demanda registrada: "${taskData.title}"`,
          'TASK',
          data.id
        );
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
    const taskToDelete = tasks.find((t) => t.id === taskId);
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

          logActivity(
            'TASK_DELETED',
            `Demanda "${taskToDelete?.title || 'Demanda'}" excluída permanentemente`,
            'TASK',
            taskId
          );

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

        logActivity(
          'PROJECT_CREATED',
          `Projeto "${projectData.name}" atualizado`,
          'PROJECT',
          projectData.id
        );
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

        logActivity(
          'PROJECT_CREATED',
          `Novo projeto criado: "${projectData.name}"`,
          'PROJECT',
          newProj.id
        );
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

          logActivity(
            'PROJECT_DELETED',
            `Projeto "${proj?.name || ''}" excluído`,
            'PROJECT',
            projectId
          );

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

        logActivity(
          'USER_CREATED',
          `Dados do desenvolvedor "${userData.name}" atualizados`,
          'USER',
          userData.id
        );
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

        logActivity(
          'USER_CREATED',
          `Novo desenvolvedor cadastrado no time: "${userData.name}"`,
          'USER',
          data.id
        );
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

          logActivity(
            'USER_DELETED',
            `Desenvolvedor "${user?.name || 'Dev'}" removido da equipe`,
            'USER',
            userId
          );

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

  // Safe Array Wrappers com useMemo estáveis
  const safeTasks = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks]);
  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);
  const safeTeamUsers = useMemo(() => (Array.isArray(teamUsers) ? teamUsers : []), [teamUsers]);

  // React 19 useDeferredValue para desacoplar a digitação na busca da filtragem pesada
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Dynamic Project Task Counts com useMemo
  const projectsWithCounts = useMemo(() => {
    return safeProjects.map((proj) => {
      const count = safeTasks.filter((t) => t.project_id === proj.id).length;
      return { ...proj, task_count: count };
    });
  }, [safeProjects, safeTasks]);

  // Dynamic Available Tags from safeTasks com useMemo
  const availableTags = useMemo(() => {
    return Array.from(
      new Set(
        safeTasks.flatMap((t) => (Array.isArray(t.tags) ? t.tags : []))
      )
    );
  }, [safeTasks]);

  // Filter & Sort Tasks com useMemo
  const filteredTasks = useMemo(() => {
    const list = safeTasks.filter((t) => {
      const matchesProject = activeProjectId ? t.project_id === activeProjectId : true;
      const matchesSearch = deferredSearchTerm.trim() === '' || 
        (t.title && t.title.toLowerCase().includes(deferredSearchTerm.toLowerCase())) || 
        (t.description && t.description.toLowerCase().includes(deferredSearchTerm.toLowerCase())) ||
        (Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(deferredSearchTerm.toLowerCase())));
      const matchesPriority = selectedPriority === 'ALL' ? true : t.priority === selectedPriority;
      const matchesAssignee = selectedAssigneeId
        ? (Array.isArray(t.assignee_ids) && t.assignee_ids.includes(selectedAssigneeId)) ||
          (t.assigned_to_id === selectedAssigneeId) ||
          (Array.isArray(t.assignees) && t.assignees.some((a) => a.id === selectedAssigneeId))
        : true;
      const matchesTag = selectedTag && selectedTag !== 'ALL'
        ? Array.isArray(t.tags) && t.tags.includes(selectedTag)
        : true;
      
      return matchesProject && matchesSearch && matchesPriority && matchesAssignee && matchesTag;
    });

    return [...list].sort((a, b) => {
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
  }, [safeTasks, activeProjectId, deferredSearchTerm, selectedPriority, selectedAssigneeId, selectedTag, sortBy]);

  const activeProject = useMemo(() => {
    return safeProjects.find((p) => p.id === activeProjectId);
  }, [safeProjects, activeProjectId]);

  const activeAssignee = useMemo(() => {
    return safeTeamUsers.find((u) => u.id === selectedAssigneeId);
  }, [safeTeamUsers, selectedAssigneeId]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredTasks.length === 0) {
      showToast('Nenhuma demanda encontrada para exportar', 'info');
      return;
    }

    const headers = ['Título', 'Projeto', 'Prioridade', 'Status', 'Tags', 'Responsáveis', 'Prazo', 'Link PR/Commit', 'Descrição', 'Criado Em'];
    
    const rows = filteredTasks.map((t) => {
      const proj = safeProjects.find((p) => p.id === t.project_id);
      const assigneesStr = Array.isArray(t.assignees) && t.assignees.length > 0
        ? t.assignees.map((a) => a.name).join('; ')
        : (t.assignee_name || 'Não atribuído');

      const tagsStr = Array.isArray(t.tags) && t.tags.length > 0
        ? t.tags.join(', ')
        : '';

      const clean = (text) => `"${(text || '').toString().replace(/"/g, '""').replace(/\n/g, ' ')}"`;

      return [
        clean(t.title),
        clean(proj?.name || 'Sem projeto'),
        clean(t.priority),
        clean(t.status),
        clean(tagsStr),
        clean(assigneesStr),
        clean(t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : 'Sem prazo'),
        clean(t.pr_url || ''),
        clean(t.description || ''),
        clean(t.created_at ? new Date(t.created_at).toLocaleString('pt-BR') : '')
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `todolabs_demandas_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✓ Arquivo CSV exportado com sucesso!', 'success');
  };

  // Stats (computed from active project scope)
  const projectTasks = safeTasks.filter((t) => (activeProjectId ? t.project_id === activeProjectId : true));
  const taskStats = {
    total: projectTasks.length,
    pending: projectTasks.filter((t) => ['IDEIAS_BACKLOG', 'EM_ANALISE', 'DESENVOLVENDO'].includes(t.status)).length,
    review: projectTasks.filter((t) => t.status === 'EM_REVISAO').length,
    done: projectTasks.filter((t) => t.status === 'CONCLUIDA').length
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        projects={projectsWithCounts}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onOpenNewProjectModal={handleOpenNewProjectModal}
        onEditProjectModal={handleOpenEditProjectModal}
        teamUsers={safeTeamUsers}
        selectedAssigneeId={selectedAssigneeId}
        onSelectAssignee={setSelectedAssigneeId}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <Header
          activeProject={activeProject}
          selectedAssignee={activeAssignee}
          onClearAssignee={() => setSelectedAssigneeId(null)}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          availableTags={availableTags}
          onExportCSV={handleExportCSV}
          onOpenActivityDrawer={() => {
            fetchActivities();
            setIsActivityDrawerOpen(true);
          }}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenNewTaskModal={handleOpenNewTaskModal}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          taskStats={taskStats}
        />

        {/* Loading Skeleton or Kanban Board */}
        {isLoading ? (
          <KanbanSkeleton />
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            viewMode={viewMode}
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

      {/* Histórico / Drawer de Atividades */}
      <ActivityDrawer
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
        activities={activities}
        isLoading={isLoadingActivities}
        onRefresh={fetchActivities}
      />

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
