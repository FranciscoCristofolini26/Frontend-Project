import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'high-contrast' | 'system';
export type AccentId = 'indigo' | 'teal' | 'orange' | 'pink' | 'blue';

export interface ThemeOption {
  id: Theme;
  label: string;
  description: string;
}

export interface AccentOption {
  id: AccentId;
  label: string;
  color: string;
  hoverColor: string;
}

const THEME_STORAGE_KEY = 'plannerfy-theme';
const ACCENT_STORAGE_KEY = 'plannerfy-accent';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly systemColorScheme = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');

  readonly themeOptions: readonly ThemeOption[] = [
    { id: 'light', label: 'Claro', description: 'Interface clara e neutra.' },
    { id: 'dark', label: 'Escuro', description: 'Interface escura com contraste confortável.' },
    { id: 'high-contrast', label: 'Escuro alto contraste', description: 'Contraste reforçado para leitura.' },
    { id: 'system', label: 'Sistema', description: 'Acompanha a preferência do dispositivo.' },
  ];

  readonly accentOptions: readonly AccentOption[] = [
    { id: 'indigo', label: 'Índigo', color: '#4F46E5', hoverColor: '#4338CA' },
    { id: 'teal', label: 'Verde-água', color: '#0F9E8D', hoverColor: '#0B7F72' },
    { id: 'orange', label: 'Laranja', color: '#EA580C', hoverColor: '#C2410C' },
    { id: 'pink', label: 'Rosa', color: '#DB2777', hoverColor: '#BE185D' },
    { id: 'blue', label: 'Azul', color: '#2563EB', hoverColor: '#1D4ED8' },
  ];

  readonly theme = signal<Theme>(this.getStoredTheme());
  readonly accent = signal<AccentId>(this.getStoredAccent());

  constructor() {
    this.applyTheme(this.theme());
    this.applyAccent(this.accent());
    this.systemColorScheme?.addEventListener('change', () => {
      if (this.theme() === 'system') this.applyTheme('system');
    });
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
    this.savePreference(THEME_STORAGE_KEY, theme);
  }

  setAccent(accent: AccentId): void {
    this.accent.set(accent);
    this.applyAccent(accent);
    this.savePreference(ACCENT_STORAGE_KEY, accent);
  }

  private getStoredTheme(): Theme {
    const savedTheme = this.readPreference(THEME_STORAGE_KEY);
    return this.themeOptions.some((option) => option.id === savedTheme) ? (savedTheme as Theme) : 'light';
  }

  private getStoredAccent(): AccentId {
    const savedAccent = this.readPreference(ACCENT_STORAGE_KEY);
    return this.accentOptions.some((option) => option.id === savedAccent)
      ? (savedAccent as AccentId)
      : 'blue';
  }

  private applyTheme(theme: Theme): void {
    const resolvedTheme = theme === 'system' ? (this.systemColorScheme?.matches ? 'dark' : 'light') : theme;
    const root = this.document.documentElement;

    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.classList.toggle('high-contrast', resolvedTheme === 'high-contrast');
  }

  private applyAccent(accentId: AccentId): void {
    const accent = this.accentOptions.find((option) => option.id === accentId);
    if (!accent) return;

    const rootStyle = this.document.documentElement.style;
    rootStyle.setProperty('--accent-color', accent.color);
    rootStyle.setProperty('--color-brand-primary', accent.color);
    rootStyle.setProperty('--color-brand-hover', accent.hoverColor);
  }

  private readPreference(key: string): string | null {
    try {
      return this.document.defaultView?.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private savePreference(key: string, value: string): void {
    try {
      this.document.defaultView?.localStorage?.setItem(key, value);
    } catch {
      // A interface continua funcional quando o armazenamento não está disponível.
    }
  }
}
