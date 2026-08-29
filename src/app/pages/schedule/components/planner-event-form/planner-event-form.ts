import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import {
  dateKey,
  PlannerCategory,
  PlannerEvent,
  PlannerEventDraft,
  PlannerEventSource,
} from '../../models';

const CATEGORY_OPTIONS: { value: PlannerCategory; label: string }[] = [
  { value: 'work', label: 'Trabalho' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'habit', label: 'Hábito' },
  { value: 'study', label: 'Estudos' },
  { value: 'health', label: 'Saúde' },
  { value: 'event', label: 'Evento' },
];

@Component({
  selector: 'app-planner-event-form',
  templateUrl: './planner-event-form.html',
  styleUrl: './planner-event-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerEventForm {
  readonly open = input(false);
  readonly date = input.required<Date>();
  readonly event = input<PlannerEvent | null>(null);
  readonly created = output<PlannerEventDraft>();
  readonly updated = output<PlannerEventDraft>();
  readonly removed = output<number>();
  readonly cancelled = output<void>();
  readonly categories = CATEGORY_OPTIONS;

  readonly title = signal('');
  readonly eventDate = signal('');
  readonly description = signal('');
  readonly location = signal('');
  readonly source = signal<PlannerEventSource>('internal');
  readonly startTime = signal('09:00');
  readonly endTime = signal('10:00');
  readonly category = signal<PlannerCategory>('work');
  readonly errorMessage = signal('');
  readonly editingEvent = computed(() => this.event());
  readonly isDirty = computed(() => {
    const event = this.editingEvent();

    if (!event) {
      return true;
    }

    return (
      this.title().trim() !== event.title ||
      this.eventDate() !== event.date ||
      this.description().trim() !== (event.description ?? '') ||
      this.location().trim() !== (event.location ?? '') ||
      this.source() !== (event.source ?? 'internal') ||
      this.startTime() !== event.startTime ||
      this.endTime() !== event.endTime ||
      this.category() !== event.category
    );
  });
  readonly heading = computed(() => {
    const event = this.editingEvent();
    if (!event) {
      return {
        eyebrow: 'Novo evento',
        title: 'Planeje um bloco no seu dia',
        submit: 'Criar evento',
      };
    }

    const itemName = event.kind === 'task' ? 'tarefa' : 'evento';
    return {
      eyebrow: `Editar ${itemName}`,
      title: `Atualize esta ${itemName}`,
      submit: 'Salvar alterações',
    };
  });
  readonly dateLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.date()),
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        this.populate(this.event());
      }
    });
  }

  updateTitle(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  updateEventDate(event: Event): void {
    this.eventDate.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  updateDescription(event: Event): void {
    this.description.set((event.target as HTMLTextAreaElement).value);
    this.errorMessage.set('');
  }

  updateLocation(event: Event): void {
    this.location.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  updateSource(event: Event): void {
    this.source.set((event.target as HTMLSelectElement).value as PlannerEventSource);
    this.errorMessage.set('');
  }

  updateStartTime(event: Event): void {
    this.startTime.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  updateEndTime(event: Event): void {
    this.endTime.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  updateCategory(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value as PlannerCategory);
    this.errorMessage.set('');
  }

  submit(event: SubmitEvent): void {
    event.preventDefault();

    if (!this.title().trim() || !this.eventDate()) {
      this.errorMessage.set('Informe um nome e uma data para o evento.');
      return;
    }

    if (!this.startTime() || !this.endTime() || this.startTime() >= this.endTime()) {
      this.errorMessage.set('O horário final deve ser posterior ao horário inicial.');
      return;
    }

    const draft = {
      title: this.title().trim(),
      date: this.eventDate(),
      description: this.description().trim(),
      location: this.location().trim() || undefined,
      source: this.source(),
      startTime: this.startTime(),
      endTime: this.endTime(),
      category: this.category(),
    };

    if (this.editingEvent()) {
      if (!this.isDirty()) {
        return;
      }
      this.updated.emit(draft);
    } else {
      this.created.emit(draft);
    }

    this.reset();
  }

  remove(): void {
    const event = this.editingEvent();
    if (event) {
      this.removed.emit(event.id);
    }
  }

  cancel(): void {
    this.reset();
    this.cancelled.emit();
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  private reset(): void {
    this.title.set('');
    this.eventDate.set(dateKey(this.date()));
    this.description.set('');
    this.location.set('');
    this.source.set('internal');
    this.startTime.set('09:00');
    this.endTime.set('10:00');
    this.category.set('work');
    this.errorMessage.set('');
  }

  private populate(event: PlannerEvent | null): void {
    this.title.set(event?.title ?? '');
    this.eventDate.set(event?.date ?? dateKey(this.date()));
    this.description.set(event?.description ?? '');
    this.location.set(event?.location ?? '');
    this.source.set(event?.source ?? 'internal');
    this.startTime.set(event?.startTime ?? '09:00');
    this.endTime.set(event?.endTime ?? '10:00');
    this.category.set(event?.category ?? 'work');
    this.errorMessage.set('');
  }
}
