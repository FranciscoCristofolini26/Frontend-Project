import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'agenda-theme';
  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
  }

  private getInitialTheme(): Theme {
    const savedTheme = this.document.defaultView?.localStorage?.getItem(this.storageKey);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return 'dark';
  }

  private applyTheme(theme: Theme): void {
    this.document.documentElement.classList.toggle('dark', theme === 'dark');
    this.document.defaultView?.localStorage?.setItem(this.storageKey, theme);
  }
}
