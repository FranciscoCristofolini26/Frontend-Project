import { Component, HostListener, OnInit, signal, effect, ElementRef, viewChild, inject } from '@angular/core';
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

  menuItems = [
    { icon: 'home', label: 'Home' },
    { icon: 'account_tree', label: 'Planning' },
    { icon: 'event', label: 'Events' },
    { icon: 'sunny', label: 'Routine' },
    { icon: 'list_alt', label: 'Tasks' },
    { icon: 'note_stack', label: 'Notes' },
  ];

  features = [
    { icon: 'settings', label: 'Config' },
  ]

  constructor() {
    this.iconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    effect(() => {
      const el = this.asideElement()?.nativeElement;
      if (!el || !this.isDesktop()) return;

      animate(el, {
        width: this.collapsed() ? '76px' : '240px',
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
      this.collapsed.set(false);
    }
  }

  toggleDesktopCollapse() {
    this.collapsed.update((v) => !v);
  }

  toggleMobileMenu() {
    this.mobileOpen.update((v) => !v);
  }
}