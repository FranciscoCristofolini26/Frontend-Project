import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CalendarEventForm } from './components/calendar-event-form/calendar-event-form';
import { CalendarEvent, CalendarEventDraft, CALENDAR_EVENT_MOCKS } from './models';
import {
  addDays,
  addMonths,
  buildMonthDays,
  compareTime,
  fromDateKey,
  isSameDay,
  startOfDay,
  startOfWeek,
  timeToMinutes,
  toDateKey,
} from './calendar.utils';

type CalendarView = 'month' | 'week';

const INITIAL_REFERENCE_DATE = new Date(2026, 7, 8);
const MAX_VISIBLE_MONTH_EVENTS = 3;
const WEEK_START_HOUR = 8;
const WEEK_END_HOUR = 20;
const PIXELS_PER_HOUR = 56;
const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const DAY_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

@Component({
  selector: 'app-calendar',
  imports: [MatIconModule, CalendarEventForm],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calendar {
  readonly view = signal<CalendarView>('month');
  readonly referenceDate = signal(startOfDay(INITIAL_REFERENCE_DATE));
  readonly selectedDate = signal(startOfDay(INITIAL_REFERENCE_DATE));
  readonly events = signal<CalendarEvent[]>(CALENDAR_EVENT_MOCKS);
  readonly selectedEvent = signal<CalendarEvent | null>(null);
  readonly formOpen = signal(false);
  readonly editingEvent = signal<CalendarEvent | null>(null);
  readonly eventPendingDeletion = signal<CalendarEvent | null>(null);
  readonly googleConnectOpen = signal(false);
  readonly googleConnected = signal(false);

  readonly monthDays = computed(() => buildMonthDays(this.referenceDate()));
  readonly weekDays = computed(() => {
    const firstDay = startOfWeek(this.referenceDate());
    return Array.from({ length: 7 }, (_, index) => addDays(firstDay, index));
  });
  readonly eventsByDate = computed(() => {
    const entries = new Map<string, CalendarEvent[]>();

    for (const event of this.events()) {
      const dayEvents = entries.get(event.date) ?? [];
      dayEvents.push(event);
      entries.set(event.date, dayEvents);
    }

    entries.forEach((dayEvents) =>
      dayEvents.sort((first, second) => compareTime(first.startTime, second.startTime)),
    );
    return entries;
  });
  readonly selectedDayEvents = computed(() => this.eventsForDate(toDateKey(this.selectedDate())));
  readonly monthLabel = computed(() =>
    this.capitalize(MONTH_FORMATTER.format(this.referenceDate())),
  );
  readonly weekLabel = computed(() => this.formatWeekRange(this.weekDays()));
  readonly selectedDateLabel = computed(() =>
    this.capitalize(DAY_FORMATTER.format(this.selectedDate())),
  );
  readonly weekHours = Array.from(
    { length: WEEK_END_HOUR - WEEK_START_HOUR + 1 },
    (_, index) => WEEK_START_HOUR + index,
  );
  readonly toDateKey = toDateKey;

  previousPeriod(): void {
    if (this.view() === 'month') {
      const previousMonth = addMonths(this.referenceDate(), -1);
      this.referenceDate.set(previousMonth);
      this.selectedDate.set(previousMonth);
    } else {
      this.referenceDate.update((date) => addDays(date, -7));
      this.selectedDate.update((date) => addDays(date, -7));
    }
    this.selectedEvent.set(null);
  }

  nextPeriod(): void {
    if (this.view() === 'month') {
      const nextMonth = addMonths(this.referenceDate(), 1);
      this.referenceDate.set(nextMonth);
      this.selectedDate.set(nextMonth);
    } else {
      this.referenceDate.update((date) => addDays(date, 7));
      this.selectedDate.update((date) => addDays(date, 7));
    }
    this.selectedEvent.set(null);
  }

  goToToday(): void {
    const today = startOfDay(new Date());
    this.referenceDate.set(today);
    this.selectedDate.set(today);
    this.selectedEvent.set(null);
  }

  setView(view: CalendarView): void {
    this.view.set(view);
  }

  selectDay(date: Date): void {
    this.selectedDate.set(startOfDay(date));
    this.selectedEvent.set(null);
  }

  selectDayFromKeyboard(event: Event, date: Date): void {
    event.preventDefault();
    this.selectDay(date);
  }

  openCreateForm(date = this.selectedDate()): void {
    this.selectedDate.set(startOfDay(date));
    this.editingEvent.set(null);
    this.formOpen.set(true);
  }

  openEvent(event: CalendarEvent, mouseEvent?: MouseEvent): void {
    mouseEvent?.stopPropagation();
    const date = fromDateKey(event.date);
    this.selectedDate.set(date);
    this.selectedEvent.set(event);
  }

  openEditForm(event: CalendarEvent): void {
    this.editingEvent.set(event);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editingEvent.set(null);
  }

  saveEvent(draft: CalendarEventDraft): void {
    const eventBeingEdited = this.editingEvent();

    if (eventBeingEdited) {
      const updatedEvent = { ...eventBeingEdited, ...draft };
      this.events.update((events) =>
        events.map((event) => (event.id === eventBeingEdited.id ? updatedEvent : event)),
      );
      this.selectedEvent.set(updatedEvent);
      this.selectedDate.set(fromDateKey(updatedEvent.date));
    } else {
      const createdEvent: CalendarEvent = {
        id: `event-${crypto.randomUUID()}`,
        ...draft,
      };
      this.events.update((events) => [...events, createdEvent]);
      this.selectedDate.set(fromDateKey(createdEvent.date));
      this.selectedEvent.set(createdEvent);
    }

    this.closeForm();
  }

  requestDeletion(event: CalendarEvent): void {
    this.eventPendingDeletion.set(event);
  }

  cancelDeletion(): void {
    this.eventPendingDeletion.set(null);
  }

  deleteEvent(): void {
    const event = this.eventPendingDeletion();
    if (!event) return;

    this.events.update((events) => events.filter((item) => item.id !== event.id));
    if (this.selectedEvent()?.id === event.id) this.selectedEvent.set(null);
    this.eventPendingDeletion.set(null);
  }

  connectGoogleCalendar(): void {
    this.googleConnected.set(true);
    this.googleConnectOpen.set(false);
  }

  eventsForDate(dateKey: string): CalendarEvent[] {
    return this.eventsByDate().get(dateKey) ?? [];
  }

  visibleMonthEvents(dateKey: string): CalendarEvent[] {
    return this.eventsForDate(dateKey).slice(0, MAX_VISIBLE_MONTH_EVENTS);
  }

  hiddenEventCount(dateKey: string): number {
    return Math.max(0, this.eventsForDate(dateKey).length - MAX_VISIBLE_MONTH_EVENTS);
  }

  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  isSelected(date: Date): boolean {
    return isSameDay(date, this.selectedDate());
  }

  dayAriaLabel(date: Date): string {
    const eventCount = this.eventsForDate(toDateKey(date)).length;
    const eventText = eventCount === 1 ? '1 evento' : `${eventCount} eventos`;
    return `${this.capitalize(DAY_FORMATTER.format(date))}, ${eventText}`;
  }

  weekdayLabel(date: Date): string {
    return this.capitalize(WEEKDAY_FORMATTER.format(date).replace('.', ''));
  }

  eventClass(event: CalendarEvent, baseClass: string): string {
    return `${baseClass} ${baseClass}--${event.category}`;
  }

  eventSourceLabel(event: CalendarEvent): string {
    return event.source === 'google' ? 'Google Calendar' : 'Meu calendário';
  }

  eventTop(event: CalendarEvent): number {
    const startMinutes = Math.max(WEEK_START_HOUR * 60, timeToMinutes(event.startTime));
    return ((startMinutes - WEEK_START_HOUR * 60) / 60) * PIXELS_PER_HOUR;
  }

  eventHeight(event: CalendarEvent): number {
    const startMinutes = Math.max(WEEK_START_HOUR * 60, timeToMinutes(event.startTime));
    const endMinutes = Math.min(WEEK_END_HOUR * 60, timeToMinutes(event.endTime));
    return Math.max(28, ((endMinutes - startMinutes) / 60) * PIXELS_PER_HOUR);
  }

  private formatWeekRange(days: Date[]): string {
    const firstDay = days[0];
    const lastDay = days[days.length - 1];

    if (firstDay.getMonth() === lastDay.getMonth()) {
      const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(firstDay);
      return `${firstDay.getDate()} – ${lastDay.getDate()} de ${this.capitalize(month)} de ${firstDay.getFullYear()}`;
    }

    const firstMonth = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(
      firstDay,
    );
    const lastMonth = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(lastDay);
    return `${firstMonth} – ${lastMonth}`;
  }

  private capitalize(value: string): string {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
  }
}
