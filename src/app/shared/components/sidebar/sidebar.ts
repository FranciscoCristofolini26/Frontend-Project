import { Component, computed, HostListener, inject, OnDestroy, output, signal } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppLogo } from '../app-logo/app-logo';
import { NAVIGATION_SECTIONS } from './navigation-sections';
import { SidebarState } from './sidebar-state';

const MOBILE_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 340;
const DEFAULT_SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_STORAGE_KEY = 'agenda.sidebar-width';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AppLogo, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: {
    '[style.width.px]': 'desktopLayoutWidth()',
    '[class.sidebar-host--resizing]': 'isResizing()',
  },
})
export class Sidebar implements OnDestroy {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sidebarState = inject(SidebarState);
  private resizeMoveListener?: (event: PointerEvent) => void;
  private resizeEndListener?: () => void;

  readonly viewportWidth = this.sidebarState.viewportWidth;
  readonly sidebarOpen = this.sidebarState.isOpen;
  readonly sidebarWidth = signal(this.getStoredSidebarWidth());
  readonly isResizing = signal(false);

  readonly isDesktop = this.sidebarState.isDesktop;
  readonly panelWidth = computed(() =>
    this.isDesktop() ? this.sidebarWidth() : MOBILE_SIDEBAR_WIDTH,
  );
  readonly desktopLayoutWidth = computed(() =>
    this.isDesktop() && this.sidebarOpen() ? this.sidebarWidth() : 0,
  );

  readonly navigationSections = NAVIGATION_SECTIONS;
  readonly settingsRequested = output<void>();

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
      return Number.isFinite(storedWidth) ? this.clampWidth(storedWidth) : DEFAULT_SIDEBAR_WIDTH;
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
