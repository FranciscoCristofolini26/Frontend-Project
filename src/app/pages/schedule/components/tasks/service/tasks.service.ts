import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../../../core/data-access/api-client.service';
import { Task } from '../../../models';

const RESOURCE = 'tasks';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly api = inject(ApiClient);

  getTasks(): Observable<Task[]> {
    return this.api.getAll<Task>(RESOURCE+"/getTask");
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.api.post<Task, Partial<Task>>(RESOURCE, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.api.put<Task, Partial<Task>>(RESOURCE, id, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.api.delete(RESOURCE, id);
  }
}
