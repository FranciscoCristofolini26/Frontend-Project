import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { ApiClient, withoutId } from '../../../core/data-access/api-client.service';
import { DemoDataStore } from '../../../core/data-access/demo-data-store.service';
import { CalendarEvent, CalendarEventDraft } from '../models';
import { toDateKey } from '../calendar.utils';

const RESOURCE = 'calendar-events';

function createDemoEvent(): CalendarEvent {
  return {
    id: 'demo-calendar-event',
    title: 'Exemplo de evento',
    date: toDateKey(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    description: 'Registro de demonstração exibido apenas quando a API não retorna eventos.',
    source: 'internal',
    category: 'personal',
  };
}

@Injectable({ providedIn: 'root' })
export class CalendarEventService {
  private readonly api = inject(ApiClient);
  private readonly demoDataStore = inject(DemoDataStore);

  readonly events = signal<CalendarEvent[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.api
      .getAll<CalendarEvent>(RESOURCE)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((events) => {
        this.events.set(
          events.length ? events : this.demoDataStore.getOrCreateList(RESOURCE, createDemoEvent),
        );
      });
  }

  create(draft: CalendarEventDraft): void {
    const event: CalendarEvent = {
      id: `local-${Date.now()}`,
      ...draft,
    };

    this.api
      .post<CalendarEvent, CalendarEventDraft>(RESOURCE, draft)
      .pipe(catchError(() => of(event)))
      .subscribe((createdEvent) => this.events.update((items) => [...items, createdEvent]));
  }

  update(event: CalendarEvent): void {
    this.api
      .put<CalendarEvent, CalendarEventDraft>(RESOURCE, event.id, withoutId(event))
      .pipe(catchError(() => of(event)))
      .subscribe((updatedEvent) =>
        this.events.update((items) =>
          items.map((item) => (item.id === updatedEvent.id ? updatedEvent : item)),
        ),
      );
  }

  remove(id: string): void {
    this.api
      .delete(RESOURCE, id)
      .pipe(catchError(() => of(undefined)))
      .subscribe(() => this.events.update((items) => items.filter((item) => item.id !== id)));
  }
}
