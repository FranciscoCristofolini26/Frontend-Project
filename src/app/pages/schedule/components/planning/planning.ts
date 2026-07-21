import { Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RoutineBlock, RoutineBlockType } from '../../models';

const TYPE_STYLES: Record<RoutineBlockType, { border: string; badge: string }> = {
  [RoutineBlockType.REUNIAO]: { border: 'border-l-brand-primary', badge: 'bg-brand-primary/10 text-brand-primary' },
  [RoutineBlockType.TAREFA]: { border: 'border-l-error', badge: 'bg-error/10 text-error' },
  [RoutineBlockType.FOCO]: { border: 'border-l-text-main', badge: 'bg-text-main/10 text-text-main' },
  [RoutineBlockType.PAUSA]: { border: 'border-l-warning', badge: 'bg-warning/10 text-warning' },
};

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 19;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

@Component({
  selector: 'app-planning',
  imports: [MatIconModule],
  templateUrl: './planning.html',
  styleUrl: './planning.css',
})
export class Planning {
  readonly RoutineBlockType = RoutineBlockType;

  readonly today = new Date();
  readonly dayLabel = this.formatDayLabel(this.today);

  routine = signal<RoutineBlock[]>([
    {
      id: 1,
      title: 'Daily Sync com Time de Produto',
      type: RoutineBlockType.REUNIAO,
      startTime: '09:00',
      endTime: '09:30',
      detail: 'Sala Virtual · 30 min',
    },
    {
      id: 2,
      title: 'Revisar proposta comercial da Acme',
      type: RoutineBlockType.TAREFA,
      startTime: '09:30',
      endTime: '10:30',
      detail: 'Vendas Q3',
      completed: false,
    },
    {
      id: 3,
      title: 'Bloco de foco profundo',
      type: RoutineBlockType.FOCO,
      startTime: '10:30',
      endTime: '12:00',
      detail: 'Sem notificações',
    },
    {
      id: 4,
      title: 'Almoço',
      type: RoutineBlockType.PAUSA,
      startTime: '12:30',
      endTime: '13:30',
      detail: 'Pausa consciente',
    },
    {
      id: 5,
      title: 'Sessão de foco: refatorar módulo de billing',
      type: RoutineBlockType.TAREFA,
      startTime: '14:00',
      endTime: '15:00',
      detail: 'Plataforma',
      completed: false,
    },
    {
      id: 6,
      title: 'Confirmar consulta médica',
      type: RoutineBlockType.TAREFA,
      startTime: '14:30',
      endTime: '15:30',
      detail: 'Pessoal',
      completed: false,
    },
    {
      id: 7,
      title: 'Revisão de sprint',
      type: RoutineBlockType.REUNIAO,
      startTime: '16:00',
      endTime: '16:45',
      detail: 'Alinhamento semanal · 45 min',
    },
  ]);

  hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);

  timeline = computed(() =>
    this.hours.map((hour) => ({
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      blocks: this.routine()
        .filter((block) => Math.floor(toMinutes(block.startTime) / 60) === hour)
        .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)),
    })),
  );

  totalBlocks = computed(() => this.routine().length);
  completedBlocks = computed(() => this.routine().filter((block) => block.completed).length);
  focusTime = computed(() => {
    const minutes = this.routine()
      .filter((block) => block.type === RoutineBlockType.FOCO)
      .reduce((sum, block) => sum + (toMinutes(block.endTime) - toMinutes(block.startTime)), 0);

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return hours > 0 ? `${hours}h${remaining > 0 ? ` ${remaining}m` : ''}` : `${remaining}m`;
  });

  toggleBlock(id: number) {
    this.routine.update((list) =>
      list.map((block) => (block.id === id ? { ...block, completed: !block.completed } : block)),
    );
  }

  typeBorder(type: RoutineBlockType): string {
    return TYPE_STYLES[type].border;
  }

  typeBadge(type: RoutineBlockType): string {
    return TYPE_STYLES[type].badge;
  }

  private formatDayLabel(date: Date): string {
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
}
