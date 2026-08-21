import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MainLayout } from './shared/components/main-layout/main-layout';

@Component({
  selector: 'app-root',
  imports: [MainLayout],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.css',
})
export class App {}
