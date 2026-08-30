import { NavigationSectionsModel } from './models/NavigationSectionsModel';

export const NAVIGATION_SECTIONS: readonly NavigationSectionsModel[] = [
  {
    title: 'INÍCIO',
    items: [
      { icon: 'home', label: 'Home', url: '/home' },
      { icon: 'dashboard', label: 'Dashboard', url: '' },
    ],
  },
  {
    title: 'PLANEJAMENTO',
    items: [
      { icon: 'view_kanban', label: 'Planner', url: '/schedule' },
      { icon: 'calendar_month', label: 'Calendário', url: '/calendar' },
      {
        icon: 'check_circle',
        label: 'Tarefas',
        url: '/schedule',
        queryParams: { view: 'tarefas' },
      },
      { icon: 'target', label: 'Metas Semanais', url: '/goals' },
      { icon: 'self_improvement', label: 'Hábitos', url: '/habits' },
      { icon: 'note', label: 'Notas', url: '/notes' },
      { icon: 'schedule', label: 'Time Blocking', url: '' },
      { icon: 'folder', label: 'Projetos', url: '/projects' },
    ],
  },
  {
    title: 'PRODUTIVIDADE',
    items: [
      { icon: 'inbox', label: 'Inbox', url: '' },
      { icon: 'priority_high', label: 'Prioridades', url: '' },
      { icon: 'trending_up', label: 'Progresso', url: '' },
      { icon: 'analytics', label: 'Estatísticas', url: '' },
      { icon: 'today', label: 'Revisão Diária', url: '' },
      { icon: 'description', label: 'Templates', url: '' },
    ],
  },
  {
    title: 'CONFIGURAÇÕES',
    items: [
      { icon: 'settings', label: 'Configurações', url: '', action: 'settings' },
      { icon: 'palette', label: 'Aparência', url: '', action: 'settings' },
      { icon: 'notifications', label: 'Notificações', url: '' },
      { icon: 'groups', label: 'Equipe', url: '' },
      { icon: 'apps', label: 'Ícones', url: '' },
    ],
  },
];
