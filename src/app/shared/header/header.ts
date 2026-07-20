import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-header',
  imports: [MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly themeService = inject(ThemeService);
}
