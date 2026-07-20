import { Component, signal, HostListener, computed } from '@angular/core';
import { Header } from "../header/header";
import { Sidebar } from "../sidebar/sidebar";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [Header, Sidebar, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  screenWidth = signal(window.innerWidth);
  sidebarCollapsed = signal(false);

  isMobile = computed(() => this.screenWidth() < 768);
  isTablet = computed(() =>
    this.screenWidth() >= 768 &&
    this.screenWidth() < 1024
  );
  isDesktop = computed(() => this.screenWidth() >= 1024);


  @HostListener('window:resize')
  onResize() {
    this.screenWidth.set(window.innerWidth);
  }

  onSidebarCollapsedChange(isCollapsed: boolean) {
    this.sidebarCollapsed.set(isCollapsed);
  }
}
