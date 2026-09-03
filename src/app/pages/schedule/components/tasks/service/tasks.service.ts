import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../../../core/data-access/api-client.service';
import { Task } from '../../../models';
import {
  SCHEDULE_TASKS_LIST_RESOURCE,
  SCHEDULE_TASKS_RESOURCE,
} from '../../../service/schedule-tasks.endpoints';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly api = inject(ApiClient);

  getTasks(): Observable<Task[]> {
    return this.api.getAll<Task>(SCHEDULE_TASKS_LIST_RESOURCE);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.api.post<Task, Partial<Task>>(SCHEDULE_TASKS_RESOURCE, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.api.put<Task, Partial<Task>>(SCHEDULE_TASKS_RESOURCE, id, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.api.delete(SCHEDULE_TASKS_RESOURCE, id);
  }
}
