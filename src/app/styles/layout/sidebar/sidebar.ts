import { Component, Input, Output, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() isDesktop = false;
  @Input() menuOpen = false;
  collapsed = signal(false);

  toggleSideBar(){
    this.collapsed.update(open => !open);
  }
}