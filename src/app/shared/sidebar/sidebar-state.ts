import { Injectable, computed, signal } from '@angular/core';

const DESKTOP_BREAKPOINT = 1024;
const TABLET_BREAKPOINT = 768;

@Injectable({ providedIn: 'root' })
export class SidebarState {
  readonly viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1280);
  readonly isOpen = signal(true);

  readonly isDesktop = computed(() => this.viewportWidth() >= DESKTOP_BREAKPOINT);
  readonly isTablet = computed(
    () => this.viewportWidth() >= TABLET_BREAKPOINT && this.viewportWidth() < DESKTOP_BREAKPOINT,
  );
  readonly isMobile = computed(() => this.viewportWidth() < TABLET_BREAKPOINT);

  /** Whether the sidebar is currently taking up horizontal space in the layout. */
  readonly occupiesLayout = computed(() => this.isDesktop() && this.isOpen());
}
