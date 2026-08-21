import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/data-access/api-client.service';
import { NoteModel } from '../models/NoteModel';

const RESOURCE = 'notes';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly api = inject(ApiClient);

  getNotes(): Observable<NoteModel[]> {
    return this.api.getAll<NoteModel>(RESOURCE);
  }

  createNote(note: Partial<NoteModel>): Observable<NoteModel> {
    return this.api.post<NoteModel, Partial<NoteModel>>(RESOURCE, note);
  }

  updateNote(id: number, note: Partial<NoteModel>): Observable<NoteModel> {
    return this.api.put<NoteModel, Partial<NoteModel>>(RESOURCE, id, note);
  }

  deleteNote(id: number): Observable<void> {
    return this.api.delete(RESOURCE, id);
  }
}
