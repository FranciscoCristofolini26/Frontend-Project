import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AppDrawerMobile } from '../app-drawer-mobile/app-drawer-mobile';
import { AppHeaderMobile } from '../app-header-mobile/app-header-mobile';
import { SettingsModal } from '../settings-modal/settings-modal';
import { Sidebar } from '../sidebar/sidebar';
import { NAVIGATION_SECTIONS } from '../sidebar/navigation-sections';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [AppDrawerMobile, AppHeaderMobile, RouterOutlet, SettingsModal, Sidebar],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly themeService = inject(ThemeService);
  private readonly mobileHeader = viewChild(AppHeaderMobile);
  private readonly mobileDrawer = viewChild(AppDrawerMobile);

  readonly drawerOpen = signal(false);
  readonly settingsOpen = signal(false);
  readonly pageTitle = signal('PlannerFy');
  readonly navigationSections = NAVIGATION_SECTIONS;
  private settingsOpener?: HTMLElement;

  constructor() {
    this.updatePageTitle();
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.updatePageTitle();
      this.closeDrawer(false);
    });

    effect(() => {
      const isOpen = this.drawerOpen();
      this.document.body.classList.toggle('app-mobile-drawer-open', isOpen);

      if (isOpen) this.mobileDrawer()?.focusFirstElement();
    });

    effect(() => {
      this.document.body.classList.toggle('app-settings-open', this.settingsOpen());
    });
  }

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(restoreFocus = true): void {
    if (!this.drawerOpen()) return;

    this.drawerOpen.set(false);
    if (restoreFocus) this.mobileHeader()?.focusMenuButton();
  }

  openSettings(): void {
    const activeElement = this.document.activeElement;
    this.settingsOpener = activeElement instanceof HTMLElement ? activeElement : undefined;
    this.settingsOpen.set(true);
  }

  closeSettings(): void {
    if (!this.settingsOpen()) return;

    this.settingsOpen.set(false);
    queueMicrotask(() => this.settingsOpener?.focus());
  }

  private updatePageTitle(): void {
    let currentRoute = this.activatedRoute;
    while (currentRoute.firstChild) currentRoute = currentRoute.firstChild;

    this.pageTitle.set((currentRoute.snapshot.data['title'] as string | undefined) ?? 'PlannerFy');
  }
}
