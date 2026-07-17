import { Component } from '@angular/core';
import { Nota } from './models';
import { MatIconModule } from '@angular/material/icon';

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
  }
