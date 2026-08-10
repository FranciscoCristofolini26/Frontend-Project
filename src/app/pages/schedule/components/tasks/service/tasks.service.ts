import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../../models';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private httpClient = inject(HttpClient);
  private API_URL = 'http://localhost:8080/tasks';

  getTasks(): Observable<Task[]> {
    return this.httpClient.get<Task[]>(this.API_URL);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.httpClient.post<Task>(this.API_URL, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.httpClient.put<Task>(`${this.API_URL}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`);
  }
}
