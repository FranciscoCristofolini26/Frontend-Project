import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AccentId, Theme, ThemeService } from '../../theme.service';

type SettingsTabId = 'appearance' | 'language' | 'account' | 'notifications' | 'privacy';

interface SettingsTab {
  id: SettingsTabId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsModal implements AfterViewInit {
  readonly themeService = inject(ThemeService);
  readonly activeTab = signal<SettingsTabId>('appearance');
  readonly tabs: readonly SettingsTab[] = [
    { id: 'appearance', label: 'Aparência', icon: 'palette' },
    { id: 'language', label: 'Idioma', icon: 'translate' },
    { id: 'account', label: 'Conta', icon: 'person' },
    { id: 'notifications', label: 'Notificações', icon: 'notifications' },
    { id: 'privacy', label: 'Privacidade e segurança', icon: 'shield' },
  ];
  readonly dismissed = output<void>();

  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');

  ngAfterViewInit(): void {
    queueMicrotask(() => this.closeButton()?.nativeElement.focus());
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'Tab') this.keepFocusInDialog(event);
  }

  close(): void {
    this.dismissed.emit();
  }

  setTab(tab: SettingsTabId): void {
    this.activeTab.set(tab);
  }

  onTabKeydown(event: KeyboardEvent, index: number): void {
    const supportedKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!supportedKeys.includes(event.key)) return;

    event.preventDefault();
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? this.tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + this.tabs.length) % this.tabs.length;
    const nextTab = this.tabs[nextIndex];

    this.setTab(nextTab.id);
    queueMicrotask(() => this.tabElements()[nextIndex]?.focus());
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  setAccent(accent: AccentId): void {
    this.themeService.setAccent(accent);
  }

  onThemeOptionKeydown(event: KeyboardEvent, index: number): void {
    this.moveRadio(event, index, this.themeService.themeOptions.length, (nextIndex) => {
      this.setTheme(this.themeService.themeOptions[nextIndex].id);
    }, '.settings-theme-option');
  }

  onAccentOptionKeydown(event: KeyboardEvent, index: number): void {
    this.moveRadio(event, index, this.themeService.accentOptions.length, (nextIndex) => {
      this.setAccent(this.themeService.accentOptions[nextIndex].id);
    }, '.settings-accent-option');
  }

  private moveRadio(
    event: KeyboardEvent,
    index: number,
    optionsLength: number,
    select: (nextIndex: number) => void,
    radioSelector: string,
  ): void {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const nextIndex = (index + direction + optionsLength) % optionsLength;
    select(nextIndex);
    queueMicrotask(() => this.radioElements(radioSelector)[nextIndex]?.focus());
  }

  private keepFocusInDialog(event: KeyboardEvent): void {
    const focusableElements = this.focusableElements();
    if (!focusableElements.length) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const current = document.activeElement;

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusableElements(): HTMLElement[] {
    return this.queryElements('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
  }

  private tabElements(): HTMLElement[] {
    return this.queryElements('[role="tab"]');
  }

  private radioElements(selector: string): HTMLElement[] {
    return this.queryElements(selector);
  }

  private queryElements(selector: string): HTMLElement[] {
    const dialog = this.dialog()?.nativeElement;
    return dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(selector)) : [];
  }
}
