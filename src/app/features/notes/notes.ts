import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Nota } from './models';

@Component({
  selector: 'app-notes',
  imports: [MatIconModule],
  templateUrl: './notes.html',
  styleUrls: ['./notes.css'],
})
export class Notes {
  notas: Nota[] = [
      {
        title: 'Nota 1',
        content: 'larp da nota 1',
        edited: new Date(),
        favourite: false,
        fixed: false
      },
      {
        title: 'Nota 2',
        content: 'larp da nota 2',
        edited: new Date(),
        favourite: false,
        fixed: false
      }
    ];

  timeAgo(date: Date): string {
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);

    if (diffMin < 60) return `há ${Math.max(diffMin, 1)}min`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `há ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? 'ontem' : `há ${diffDays} dias`;
  }
}
