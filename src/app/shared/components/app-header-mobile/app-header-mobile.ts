import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header-mobile',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './app-header-mobile.html',
  styleUrl: './app-header-mobile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderMobile {
  readonly title = input.required<string>();
  readonly drawerOpen = input(false);
  readonly menuRequested = output<void>();
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');

  focusMenuButton(): void {
    queueMicrotask(() => this.menuButton()?.nativeElement.focus());
  }
}
