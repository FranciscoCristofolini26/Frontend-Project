import { Component, Input, Output, signal } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
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