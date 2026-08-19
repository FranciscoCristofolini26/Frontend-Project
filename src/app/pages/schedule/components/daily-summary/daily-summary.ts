import { ChangeDetectionStrategy, Component, computed, input, OnInit } from '@angular/core';
import { TaskService } from '@app/shared/service/Task/task.service'; 
import { EventService } from '@app/shared/service/Event/event.service';

interface SummaryMetric {
  id: 'tasks' | 'events' | 'habits' | 'planned';
  value: string | number;
  label: string;
  highlighted?: boolean;
}

@Component({
  selector: 'app-daily-summary',
  imports: [],
  templateUrl: './daily-summary.html',
  styleUrl: './daily-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailySummaryComponent implements OnInit{
  tasksCount: number = 0;
  eventsCount: number = 0;
  totalCount: number = 0;
  isLoading: boolean = true;

  readonly taskCount = input(0);
  readonly eventCount = input(0);
  readonly habitCount = input(0);
  readonly plannedHours = input('0h');

  readonly metrics = computed<SummaryMetric[]>(() => [
    { id: 'tasks', value: this.taskCount(), label: 'Tarefas' },
    { id: 'events', value: this.eventCount(), label: 'Eventos' },
    { id: 'habits', value: this.habitCount(), label: 'Hábitos' },
    { id: 'planned', value: this.plannedHours(), label: 'Planejadas', highlighted: true },
  ]);

  constructor(
    private taskService: TaskService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadResume();
  }

  loadResume():void {
    this.isLoading = true;

     this.taskService.getTaskCountToday().subscribe({
      next: (count) => {
        this.tasksCount = count;
        this.updateTotal();
      },
      error: (error) => {
        console.error('Erro ao buscar tasks:', error);
        this.tasksCount = 0;
        this.updateTotal();
      }
    });

    this.eventService.getEventCountToday().subscribe({
      next: (count) => {
        this.eventsCount = count;
        this.updateTotal();
      },
      error: (error) => {
        console.error('Erro ao buscar events:', error);
        this.eventsCount = 0;
        this.updateTotal();
      }
    });
  }

  private updateTotal(): void {
    this.totalCount = this.tasksCount + this.eventsCount;
    this.isLoading = false;
  }
}