import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar, Header, Footer } from './styles/layout';
import { Calendar, Files, Goals, Habits, Home, Login, Notes, Projects } from './features';
import { MainLayout } from "./styles/layout/main-layout/main-layout";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, Footer, Calendar, Files, Goals, Habits, Home, Notes, Projects, Login, MainLayout],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('AgendaFrontend');
}
