import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PlannerCategory, PlannerEvent } from '../../models';

const CATEGORY_LABELS: Record<PlannerCategory, string> = {
  work: 'Trabalho',
  study: 'Estudos',
  personal: 'Pessoal',
  event: 'Evento',
  habit: 'Hábito',
};

@Component({
  selector: 'app-planner-event-card',
  imports: [MatIconModule],
  templateUrl: './planner-event-card.html',
  styleUrl: './planner-event-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerEventCard {
  readonly event = input.required<PlannerEvent>();
  readonly compact = input(false);
  readonly remove = output<number>();
  readonly edit = output<PlannerEvent>();
  readonly categoryLabel = computed(() => CATEGORY_LABELS[this.event().category]);

  editEvent(): void {
    this.edit.emit(this.event());
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    this.editEvent();
  }

  removeEvent(event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit(this.event().id);
  }
}
