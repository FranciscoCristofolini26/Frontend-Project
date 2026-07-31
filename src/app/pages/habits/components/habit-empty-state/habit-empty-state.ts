import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-habit-empty-state',
  imports: [MatIconModule],
  templateUrl: './habit-empty-state.html',
  styleUrl: './habit-empty-state.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitEmptyState {
  readonly create = output<void>();
}
