import { Component, HostListener, OnInit, signal, effect, ElementRef, viewChild, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { animate } from 'animejs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private iconRegistry = inject(MatIconRegistry);

  asideElement = viewChild<ElementRef>('asideRef');
  screenWidth = signal(window.innerWidth);
  isDesktop = signal(window.innerWidth >= 1024);
  collapsed = signal(false);
  mobileOpen = signal(false);
  readonly desktopCollapsedChange = output<boolean>();

  navigationSections = [
    {
      title: 'INÍCIO',
      items: [
        { icon: 'home', label: 'Home', active: true },
        { icon: 'dashboard', label: 'Dashboard' },
      ],
    },
    {
      title: 'PLANEJAMENTO',
      items: [
        { icon: 'view_kanban', label: 'Planner' },
        { icon: 'calendar_month', label: 'Calendário' },
        { icon: 'check_circle', label: 'Tarefas' },
        { icon: 'target', label: 'Metas Semanais' },
        { icon: 'self_improvement', label: 'Hábitos' },
        { icon: 'note', label: 'Notas' },
        { icon: 'schedule', label: 'Time Blocking' },
        { icon: 'folder', label: 'Projetos' },
      ],
    },
    {
      title: 'PRODUTIVIDADE',
      items: [
        { icon: 'inbox', label: 'Inbox' },
        { icon: 'priority_high', label: 'Prioridades' },
        { icon: 'trending_up', label: 'Progresso' },
        { icon: 'analytics', label: 'Estatísticas' },
        { icon: 'today', label: 'Revisão Diária' },
        { icon: 'description', label: 'Templates' },
      ],
    },
    {
      title: 'ASSISTENTE IA',
      items: [
        { icon: 'psychology', label: 'Planejamento Inteligente' },
        { icon: 'lightbulb', label: 'Sugestões' },
        { icon: 'insights', label: 'Insights' },
      ],
    },
    {
      title: 'CONFIGURAÇÕES',
      items: [
        { icon: 'settings', label: 'Configurações' },
        { icon: 'palette', label: 'Aparência' },
        { icon: 'notifications', label: 'Notificações' },
        { icon: 'groups', label: 'Equipe' },
        { icon: 'apps', label: 'Ícones' },
      ],
    },
  ];

  constructor() {
    this.iconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    effect(() => {
      const el = this.asideElement()?.nativeElement;
      if (!el || !this.isDesktop()) return;

      animate(el, {
        width: this.collapsed() ? '76px' : '264px',
        duration: 350,
        ease: 'easeOutQuart',
      });
    });

    effect(() => {
      if (this.isDesktop()) {
        this.mobileOpen.set(false);
      }
    });
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const isDesk = window.innerWidth >= 1024;
    this.isDesktop.set(isDesk);
    const el = this.asideElement()?.nativeElement;

    if (!el) return;

    if (!isDesk) {
      el.style.removeProperty('width');
      el.style.removeProperty('border-radius');
      if (this.collapsed()) {
        this.collapsed.set(false);
        this.desktopCollapsedChange.emit(false);
      }
    }
  }

  toggleDesktopCollapse() {
    const nextState = !this.collapsed();
    this.collapsed.set(nextState);
    this.desktopCollapsedChange.emit(nextState);
  }

  toggleMobileMenu() {
    this.mobileOpen.update((v) => !v);
  }
}
