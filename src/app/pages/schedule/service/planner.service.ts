import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { ApiClient, withoutId } from '../../../core/data-access/api-client.service';
import { DemoDataStore } from '../../../core/data-access/demo-data-store.service';
import { PlannerEvent, PlannerEventDraft, PlannerTask, dateKey } from '../models';

const EVENTS_RESOURCE = 'planner/events';
const TASKS_RESOURCE = 'planner/tasks';

function createDemoEvent(): PlannerEvent {
  return {
    id: 1,
    date: dateKey(new Date()),
    title: 'Exemplo de compromisso',
    description: 'Evento de demonstração exibido somente sem dados da API.',
    startTime: '09:00',
    endTime: '10:00',
    category: 'personal',
    kind: 'event',
  };
}

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly api = inject(ApiClient);
  private readonly demoDataStore = inject(DemoDataStore);

  readonly events = signal<PlannerEvent[]>([]);
  readonly unscheduledTasks = signal<PlannerTask[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadEvents();
    this.loadUnscheduledTasks();
  }

  createEvent(draft: PlannerEventDraft, date: string, kind: PlannerEvent['kind'] = 'event'): void {
    const event: PlannerEvent = {
      id: this.nextEventId(),
      date,
      kind,
      ...draft,
    };
    this.api
      .post<PlannerEvent, Omit<PlannerEvent, 'id'>>(EVENTS_RESOURCE, withoutId(event))
      .pipe(catchError(() => of(event)))
      .subscribe((createdEvent) => this.events.update((items) => [...items, createdEvent]));
  }

  updateEvent(event: PlannerEvent): void {
    this.api
      .put<PlannerEvent, Omit<PlannerEvent, 'id'>>(EVENTS_RESOURCE, event.id, withoutId(event))
      .pipe(catchError(() => of(event)))
      .subscribe((updatedEvent) =>
        this.events.update((items) =>
          items.map((item) => (item.id === updatedEvent.id ? updatedEvent : item)),
        ),
      );
  }

  removeEvent(id: number): void {
    this.api
      .delete(EVENTS_RESOURCE, id)
      .pipe(catchError(() => of(undefined)))
      .subscribe(() => this.events.update((items) => items.filter((item) => item.id !== id)));
  }

  removeUnscheduledTask(id: number): void {
    this.api
      .delete(TASKS_RESOURCE, id)
      .pipe(catchError(() => of(undefined)))
      .subscribe(() =>
        this.unscheduledTasks.update((items) => items.filter((item) => item.id !== id)),
      );
  }

  private loadEvents(): void {
    this.api
      .getAll<PlannerEvent>(EVENTS_RESOURCE)
      .pipe(catchError(() => of([])))
      .subscribe((events) => {
        this.events.set(
          events.length
            ? events
            : this.demoDataStore.getOrCreateList('planner-events', createDemoEvent),
        );
      });
  }

  private loadUnscheduledTasks(): void {
    this.api
      .getAll<PlannerTask>(TASKS_RESOURCE)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((tasks) => this.unscheduledTasks.set(tasks));
  }

  private nextEventId(): number {
    return Math.max(0, ...this.events().map((event) => event.id)) + 1;
  }
}
