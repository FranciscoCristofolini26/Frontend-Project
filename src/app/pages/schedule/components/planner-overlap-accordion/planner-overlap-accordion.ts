import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  input,
  output,
  signal,
} from '@angular/core';
import { animate } from 'animejs';
import { PlannerEvent } from '../../models';

@Component({
  selector: 'app-planner-overlap-accordion',
  imports: [],
  templateUrl: './planner-overlap-accordion.html',
  styleUrl: './planner-overlap-accordion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerOverlapAccordion {
  readonly events = input.required<PlannerEvent[]>();
  readonly eventEdited = output<PlannerEvent>();
  readonly eventRemoved = output<number>();
  readonly expandedEventId = signal<number | null>(null);

  @ViewChildren('accordionItem') private readonly accordionItems!: QueryList<ElementRef<HTMLElement>>;

  toggle(event: PlannerEvent): void {
    const previousHeights = this.itemHeights();
    this.expandedEventId.update((current) => (current === event.id ? null : event.id));
    queueMicrotask(() => this.animateItems(previousHeights));
  }

  expandOnHover(event: PlannerEvent): void {
    if (typeof window === 'undefined' || !window.matchMedia('(hover: hover)').matches) {
      return;
    }

    if (this.expandedEventId() !== event.id) {
      const previousHeights = this.itemHeights();
      this.expandedEventId.set(event.id);
      queueMicrotask(() => this.animateItems(previousHeights));
    }
  }

  edit(event: PlannerEvent, clickEvent: MouseEvent): void {
    clickEvent.stopPropagation();
    this.eventEdited.emit(event);
  }

  remove(event: PlannerEvent, clickEvent: MouseEvent): void {
    clickEvent.stopPropagation();
    this.eventRemoved.emit(event.id);
  }

  private itemHeights(): Map<HTMLElement, number> {
    return new Map(this.accordionItems.map((item) => [item.nativeElement, item.nativeElement.offsetHeight]));
  }

  private animateItems(previousHeights: Map<HTMLElement, number>): void {
    this.accordionItems.forEach((item) => {
      const previousHeight = previousHeights.get(item.nativeElement) ?? item.nativeElement.offsetHeight;
      item.nativeElement.style.height = '';
      const targetHeight = item.nativeElement.offsetHeight;
      item.nativeElement.style.height = `${previousHeight}px`;
      animate(item.nativeElement, {
        height: targetHeight,
        duration: 220,
        ease: 'out(3)',
        onComplete: () => {
          item.nativeElement.style.height = '';
        },
      });
    });
  }
}
