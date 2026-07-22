import { Component, computed, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IconModel } from './models/IconModel';
import { NavigationSectionsModel } from './models/NavigationSectionsModel';

const DESKTOP_BREAKPOINT = 1024;
const MOBILE_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 340;
const DEFAULT_SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_STORAGE_KEY = 'agenda.sidebar-width';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: {
    '[style.width.px]': 'desktopLayoutWidth()',
    '[class.sidebar-host--resizing]': 'isResizing()',
  },
})
export class Sidebar implements OnDestroy {
  private readonly iconRegistry = inject(MatIconRegistry);
  private resizeMoveListener?: (event: PointerEvent) => void;
  private resizeEndListener?: () => void;

  readonly viewportWidth = signal(window.innerWidth);
  readonly sidebarOpen = signal(true);
  readonly sidebarWidth = signal(this.getStoredSidebarWidth());
  readonly isResizing = signal(false);

  readonly isDesktop = computed(() => this.viewportWidth() >= DESKTOP_BREAKPOINT);
  readonly isTablet = computed(
    () => this.viewportWidth() >= 768 && this.viewportWidth() < DESKTOP_BREAKPOINT,
  );
  readonly isMobile = computed(() => this.viewportWidth() < 768);
  readonly panelWidth = computed(() =>
    this.isDesktop() ? this.sidebarWidth() : MOBILE_SIDEBAR_WIDTH,
  );
  readonly desktopLayoutWidth = computed(() =>
    this.isDesktop() && this.sidebarOpen() ? this.sidebarWidth() : 0,
  );


  readonly navigationSections: NavigationSectionsModel[] = [
    {
      title: 'INÍCIO',
      items: [
        { icon: 'home', label: 'Home', active: true, url: ''},
        { icon: 'dashboard', label: 'Dashboard', url: ''},
      ],
    },
    {
      title: 'PLANEJAMENTO',
      items: [
        {
          icon: 'view_kanban', label: 'Planner',
          url: 'schedule'
        },
        {
          icon: 'calendar_month', label: 'Calendário',
          url: ''
        },
        {
          icon: 'check_circle', label: 'Tarefas',
          url: 'schedule'
        },
        {
          icon: 'target', label: 'Metas Semanais',
          url: ''
        },
        {
          icon: 'self_improvement', label: 'Hábitos',
          url: ''
        },
        {
          icon: 'note', label: 'Notas',
          url: 'notes'
        },
        {
          icon: 'schedule', label: 'Time Blocking',
          url: ''
        },
        {
          icon: 'folder', label: 'Projetos',
          url: ''
        },
      ],
    },
    {
      title: 'PRODUTIVIDADE',
      items: [
        {
          icon: 'inbox', label: 'Inbox',
          url: ''
        },
        {
          icon: 'priority_high', label: 'Prioridades',
          url: ''
        },
        {
          icon: 'trending_up', label: 'Progresso',
          url: ''
        },
        {
          icon: 'analytics', label: 'Estatísticas',
          url: ''
        },
        {
          icon: 'today', label: 'Revisão Diária',
          url: ''
        },
        {
          icon: 'description', label: 'Templates',
          url: ''
        },
      ],
    },
    {
      title: 'ASSISTENTE IA',
      items: [
        {
          icon: 'psychology', label: 'Planejamento Inteligente',
          url: ''
        },
        {
          icon: 'lightbulb', label: 'Sugestões',
          url: ''
        },
        {
          icon: 'insights', label: 'Insights',
          url: ''
        },
      ],
    },
    {
      title: 'CONFIGURAÇÕES',
      items: [
        {
          icon: 'settings', label: 'Configurações',
          url: ''
        },
        {
          icon: 'palette', label: 'Aparência',
          url: ''
        },
        {
          icon: 'notifications', label: 'Notificações',
          url: ''
        },
        {
          icon: 'groups', label: 'Equipe',
          url: ''
        },
        {
          icon: 'apps', label: 'Ícones',
          url: ''
        },
      ],
    },
  ];

  constructor() {
    this.iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }

  @HostListener('window:resize')
  onResize() {
    const wasDesktop = this.isDesktop();
    this.viewportWidth.set(window.innerWidth);

    if (wasDesktop !== this.isDesktop()) {
      this.sidebarOpen.set(this.isDesktop());
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (!this.isDesktop()) {
      this.closeSidebar();
    }
  }

  openSidebar() {
    this.sidebarOpen.set(true);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  startResize(event: PointerEvent) {
    if (!this.isDesktop()) return;

    event.preventDefault();
    this.stopResize(false);

    const startX = event.clientX;
    const startWidth = this.sidebarWidth();
    this.isResizing.set(true);

    this.resizeMoveListener = (moveEvent: PointerEvent) => {
      const nextWidth = this.clampWidth(startWidth + moveEvent.clientX - startX);
      this.sidebarWidth.set(nextWidth);
    };
    this.resizeEndListener = () => this.stopResize();

    window.addEventListener('pointermove', this.resizeMoveListener);
    window.addEventListener('pointerup', this.resizeEndListener, { once: true });
    window.addEventListener('pointercancel', this.resizeEndListener, { once: true });
  }

  ngOnDestroy() {
    this.stopResize(false);
  }

  private stopResize(saveWidth = true) {
    if (this.resizeMoveListener) {
      window.removeEventListener('pointermove', this.resizeMoveListener);
      this.resizeMoveListener = undefined;
    }

    if (this.resizeEndListener) {
      window.removeEventListener('pointerup', this.resizeEndListener);
      window.removeEventListener('pointercancel', this.resizeEndListener);
      this.resizeEndListener = undefined;
    }

    if (this.isResizing() && saveWidth) {
      this.saveSidebarWidth();
    }
    this.isResizing.set(false);
  }

  private getStoredSidebarWidth() {
    try {
      const storedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
      return Number.isFinite(storedWidth)
        ? this.clampWidth(storedWidth)
        : DEFAULT_SIDEBAR_WIDTH;
    } catch {
      return DEFAULT_SIDEBAR_WIDTH;
    }
  }

  private saveSidebarWidth() {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(this.sidebarWidth()));
    } catch {
      // A interface continua funcional caso o armazenamento esteja indisponível.
    }
  }

  private clampWidth(width: number) {
    return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));
  }
}
