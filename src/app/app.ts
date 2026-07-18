import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/header/header';
import { Sidebar } from './shared/sidebar/sidebar';
import { Calendar, Files, Goals, Habits, Home, Login, Notes, Projects } from './pages';
import { MainLayout } from "./shared/main-layout/main-layout";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, Calendar, Files, Goals, Habits, Home, Notes, Projects, Login, MainLayout],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('AgendaFrontend');
}
