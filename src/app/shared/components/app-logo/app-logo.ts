import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './app-logo.html',
  styleUrl: './app-logo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.app-logo--compact]': "size() === 'compact'",
  },
})
export class AppLogo {
  readonly size = input<'default' | 'compact'>('default');
}
