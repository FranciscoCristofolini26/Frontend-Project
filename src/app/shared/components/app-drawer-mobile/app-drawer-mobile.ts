import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppLogo } from '../app-logo/app-logo';
import { NavigationSectionsModel } from '../sidebar/models/NavigationSectionsModel';

@Component({
  selector: 'app-drawer-mobile',
  standalone: true,
  imports: [AppLogo, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './app-drawer-mobile.html',
  styleUrl: './app-drawer-mobile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDrawerMobile {
  readonly open = input(false);
  readonly suspended = input(false);
  readonly sections = input.required<readonly NavigationSectionsModel[]>();
  readonly dismissed = output<void>();
  readonly settingsRequested = output<void>();
  private readonly drawer = viewChild<ElementRef<HTMLElement>>('drawer');

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.open() || this.suspended()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.dismissed.emit();
      return;
    }

    if (event.key === 'Tab') this.keepFocusInDrawer(event);
  }

  focusFirstElement(): void {
    queueMicrotask(() => this.focusableElements()[0]?.focus());
  }

  closeAfterNavigation(): void {
    this.dismissed.emit();
  }

  private keepFocusInDrawer(event: KeyboardEvent): void {
    const focusableElements = this.focusableElements();
    if (!focusableElements.length) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const current = document.activeElement;

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusableElements(): HTMLElement[] {
    const drawer = this.drawer()?.nativeElement;
    if (!drawer) return [];

    return Array.from(
      drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    ).filter((element) => !element.hasAttribute('disabled'));
  }
}
