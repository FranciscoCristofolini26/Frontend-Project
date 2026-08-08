import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  CalendarEvent,
  CalendarEventCategory,
  CalendarEventDraft,
  CalendarEventSource,
} from '../../models';

interface EventFormDraft {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  source: CalendarEventSource;
  category: CalendarEventCategory;
}

const CATEGORY_OPTIONS: { value: CalendarEventCategory; label: string }[] = [
  { value: 'work', label: 'Trabalho' },
  { value: 'study', label: 'Estudos' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'health', label: 'Saúde' },
];

@Component({
  selector: 'app-calendar-event-form',
  imports: [FormsModule, MatIconModule],
  templateUrl: './calendar-event-form.html',
  styleUrl: './calendar-event-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEventForm {
  readonly event = input<CalendarEvent | null>(null);
  readonly initialDate = input.required<string>();
  readonly save = output<CalendarEventDraft>();
  readonly close = output<void>();
  readonly categories = CATEGORY_OPTIONS;

  draft: EventFormDraft = this.emptyDraft('');
  submitted = false;

  constructor() {
    effect(() => {
      const event = this.event();
      this.draft = event
        ? {
            title: event.title,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            description: event.description,
            location: event.location ?? '',
            source: event.source,
            category: event.category,
          }
        : this.emptyDraft(this.initialDate());
      this.submitted = false;
    });
  }

  submit(): void {
    this.submitted = true;
    if (
      !this.draft.title.trim() ||
      !this.draft.date ||
      !this.draft.startTime ||
      !this.draft.endTime
    ) {
      return;
    }
    if (this.draft.startTime >= this.draft.endTime) return;

    this.save.emit({
      title: this.draft.title.trim(),
      date: this.draft.date,
      startTime: this.draft.startTime,
      endTime: this.draft.endTime,
      description: this.draft.description.trim(),
      location: this.draft.location.trim() || undefined,
      source: this.draft.source,
      category: this.draft.category,
    });
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }

  private emptyDraft(date: string): EventFormDraft {
    return {
      title: '',
      date,
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      source: 'internal',
      category: 'work',
    };
  }
}
