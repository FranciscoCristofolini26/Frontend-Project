import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of } from 'rxjs';
import { CalendarEventForm } from './components/calendar-event-form/calendar-event-form';
import { CalendarEvent, CalendarEventDraft } from './models';
import { CalendarEventService } from './service/calendar-event.service';
import { TasksService } from '../schedule/components/tasks/service/tasks.service';
import { Task, TaskPriority } from '../schedule/models';
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
export class Calendar implements OnInit {
  private readonly calendarEventService = inject(CalendarEventService);
  private readonly tasksService = inject(TasksService);

  readonly view = signal<CalendarView>('month');
  readonly referenceDate = signal(startOfDay(new Date()));
  readonly selectedDate = signal(startOfDay(new Date()));
  readonly taskEvents = signal<CalendarEvent[]>([]);
  readonly events = computed(() => [...this.calendarEventService.events(), ...this.taskEvents()]);
  readonly dataLoadFailed = signal(false);
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

  ngOnInit(): void {
    this.tasksService
      .getTasks()
      .pipe(
        catchError(() => {
          this.dataLoadFailed.set(true);
          return of<Task[]>([]);
        }),
      )
      .subscribe((tasks) => this.taskEvents.set(tasks.flatMap((task) => this.taskToCalendarEvent(task))));
  }

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
      this.calendarEventService.update(updatedEvent);
      this.selectedEvent.set(updatedEvent);
      this.selectedDate.set(fromDateKey(updatedEvent.date));
    } else {
      this.calendarEventService.create(draft);
      this.selectedDate.set(fromDateKey(draft.date));
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

    this.calendarEventService.remove(event.id);
    if (this.selectedEvent()?.id === event.id) this.selectedEvent.set(null);
    this.eventPendingDeletion.set(null);
  }

  connectGoogleCalendar(): void {
    this.googleConnected.set(true);
    this.googleConnectOpen.set(false);
  }

  closeGoogleDialog(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.googleConnectOpen.set(false);
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
    if (this.isTask(event)) return 'Tarefa';
    return event.source === 'google' ? 'Google Calendar' : 'Meu calendário';
  }

  eventTop(event: CalendarEvent): number {
    const startMinutes = Math.max(WEEK_START_HOUR * 60, timeToMinutes(event.startTime));
    return ((startMinutes - WEEK_START_HOUR * 60) / 60) * PIXELS_PER_HOUR;
  }

  isTask(event: CalendarEvent): boolean {
    return String(event.id).startsWith('task-');
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

  private taskToCalendarEvent(task: Task): CalendarEvent[] {
    const date = this.taskDateKey(task);
    if (!date) {
      return [];
    }

    const startTime = this.taskStartTime(task.dueLabel);
    return [
      {
        id: `task-${task.id}`,
        title: task.title,
        date,
        startTime,
        endTime: this.addOneHour(startTime),
        description: task.notes ? `Tarefa: ${task.notes}` : 'Tarefa',
        source: 'internal',
        category: this.taskCategory(task.priority),
      },
    ];
  }

  private taskDateKey(task: Task): string | null {
    const label = task.dueLabel?.trim();
    if (!label || label === 'Sem data') {
      return null;
    }

    const normalizedLabel = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
    const today = startOfDay(new Date());

    if (normalizedLabel.startsWith('hoje')) {
      return toDateKey(today);
    }
    if (normalizedLabel.startsWith('amanha')) {
      return toDateKey(addDays(today, 1));
    }

    const isoDate = label.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (isoDate) {
      return this.dateKeyFromParts(Number(isoDate[1]), Number(isoDate[2]), Number(isoDate[3]));
    }

    const brazilianDate = label.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/);
    if (!brazilianDate) {
      return null;
    }

    return this.dateKeyFromParts(
      Number(brazilianDate[3] ?? today.getFullYear()),
      Number(brazilianDate[2]),
      Number(brazilianDate[1]),
    );
  }

  private taskStartTime(dueLabel: string): string {
    return dueLabel.match(/\b(?:[01]\d|2[0-3]):[0-5]\d\b/)?.[0] ?? '08:00';
  }

  private addOneHour(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endInMinutes = Math.min(hours * 60 + minutes + 60, 23 * 60 + 59);
    return `${Math.floor(endInMinutes / 60)
      .toString()
      .padStart(2, '0')}:${(endInMinutes % 60).toString().padStart(2, '0')}`;
  }

  private taskCategory(priority: TaskPriority): CalendarEvent['category'] {
    if (priority === TaskPriority.ALTA) return 'work';
    if (priority === TaskPriority.MEDIA) return 'study';
    return 'personal';
  }

  private dateKeyFromParts(year: number, month: number, day: number): string | null {
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return toDateKey(date);
  }
}
