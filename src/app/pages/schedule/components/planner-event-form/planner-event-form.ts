import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { PlannerCategory, PlannerEventDraft } from '../../models';

const CATEGORY_OPTIONS: Array<{ value: PlannerCategory; label: string }> = [
  { value: 'work', label: 'Trabalho' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'habit', label: 'Hábito' },
  { value: 'study', label: 'Estudos' },
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
  readonly created = output<PlannerEventDraft>();
  readonly cancelled = output<void>();
  readonly categories = CATEGORY_OPTIONS;

  readonly title = signal('');
  readonly description = signal('');
  readonly startTime = signal('09:00');
  readonly endTime = signal('10:00');
  readonly category = signal<PlannerCategory>('work');
  readonly errorMessage = signal('');
  readonly dateLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.date()),
  );

  updateTitle(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  updateDescription(event: Event): void {
    this.description.set((event.target as HTMLTextAreaElement).value);
  }

  updateStartTime(event: Event): void {
    this.startTime.set((event.target as HTMLInputElement).value);
  }

  updateEndTime(event: Event): void {
    this.endTime.set((event.target as HTMLInputElement).value);
  }

  updateCategory(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value as PlannerCategory);
  }

  submit(event: SubmitEvent): void {
    event.preventDefault();

    if (!this.title().trim()) {
      this.errorMessage.set('Informe um nome para o evento.');
      return;
    }

    if (!this.startTime() || !this.endTime() || this.startTime() >= this.endTime()) {
      this.errorMessage.set('O horário final deve ser posterior ao horário inicial.');
      return;
    }

    this.created.emit({
      title: this.title().trim(),
      description: this.description().trim(),
      startTime: this.startTime(),
      endTime: this.endTime(),
      category: this.category(),
    });
    this.reset();
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
    this.description.set('');
    this.startTime.set('09:00');
    this.endTime.set('10:00');
    this.category.set('work');
    this.errorMessage.set('');
  }
}
