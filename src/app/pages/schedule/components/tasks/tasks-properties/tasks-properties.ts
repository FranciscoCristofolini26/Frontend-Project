import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Task, TaskPriority } from '../../../models';

@Component({
  selector: 'app-tasks-properties',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  templateUrl: './tasks-properties.html',
  styleUrl: './tasks-properties.css',
})
export class TasksProperties {
  closeForm = output<void>();
  saveForm = output<Omit<Task, 'id'>>();

  taskForm: FormGroup;
  priorities = Object.values(TaskPriority);

  selectedDate = signal<Date | null>(null);
  selectedTime = signal<string>('');

  private fb = inject(FormBuilder);

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      priority: [TaskPriority.NORMAL, Validators.required],
      dueDate: [null],
      dueTime: [''],
      notes: [''],
      completed: [false],
    });
  }

  onDateChange(date: Date | null) {
    this.selectedDate.set(date);
    this.updateDueLabel();
  }

  onTimeChange(time: string) {
    this.selectedTime.set(time);
    this.updateDueLabel();
  }

  private updateDueLabel() {
    const date = this.selectedDate();
    const time = this.selectedTime();

    if (!date && !time) {
      return;
    }

    let label = '';
    if (date) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const isToday = date.toDateString() === today.toDateString();
      const isTomorrow = date.toDateString() === tomorrow.toDateString();

      if (isToday) {
        label = 'Hoje';
      } else if (isTomorrow) {
        label = 'Amanhã';
      } else {
        label = date.toLocaleDateString('pt-BR');
      }
    }

    if (time) {
      label += label ? `, ${time}` : time;
    }

    if (!label) {
      label = 'Sem data';
    }

    this.taskForm.patchValue({ dueLabel: label });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const task: Omit<Task, 'id'> = {
        title: formValue.title,
        priority: formValue.priority,
        dueLabel: this.getDueLabel(),
        notes: formValue.notes || undefined,
        completed: formValue.completed,
      };
      this.saveForm.emit(task);
      this.onClose();
    }
  }

  private getDueLabel(): string {
    const date = this.selectedDate();
    const time = this.selectedTime();

    if (!date && !time) {
      return 'Sem data';
    }

    let label = '';
    if (date) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const isToday = date.toDateString() === today.toDateString();
      const isTomorrow = date.toDateString() === tomorrow.toDateString();

      if (isToday) {
        label = 'Hoje';
      } else if (isTomorrow) {
        label = 'Amanhã';
      } else {
        label = date.toLocaleDateString('pt-BR');
      }
    }

    if (time) {
      label += label ? `, ${time}` : time;
    }

    return label || 'Sem data';
  }

  onClose() {
    this.closeForm.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
