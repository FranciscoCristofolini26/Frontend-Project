import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NoteModel } from '../models/NoteModel'
@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private httpClient = inject(HttpClient);
  private API_URL = 'http://localhost:8080/notes';

  getNotes(): Observable<NoteModel[]> {
    return this.httpClient.get<NoteModel[]>(this.API_URL);
  }

  createNote(nota: Partial<NoteModel>): Observable<NoteModel> {
    return this.httpClient.post<NoteModel>(this.API_URL, nota);
  }

  updateNote(id: number, nota: Partial<NoteModel>): Observable<NoteModel> {
    return this.httpClient.put<NoteModel>(`${this.API_URL}/${id}`, nota);
  }

  deleteNote(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`);
  }
}
