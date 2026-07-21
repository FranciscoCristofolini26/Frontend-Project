import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Planning } from './components/planning/planning';
import { Tasks } from './components/tasks/tasks';

type ScheduleView = 'planejamento' | 'tarefas';

@Component({
  selector: 'app-schedule',
  imports: [MatIconModule, Planning, Tasks],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule {
  view = signal<ScheduleView>('tarefas');
  tasksDetailOpen = signal(false);

  setView(view: ScheduleView) {
    this.view.set(view);
  }
}
