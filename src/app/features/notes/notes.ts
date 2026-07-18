import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Nota } from './models';

@Component({
  selector: 'app-notes',
  imports: [FormsModule, MatIconModule],
  templateUrl: './notes.html',
  styleUrls: ['./notes.css'],
})
export class Notes implements OnInit {
  private readonly storageKey = 'agenda-notes';
  notas: Nota[] = [];
  searchTerm = '';
  isEditorOpen = false;
  isCreating = false;
  editingId: string | null = null;
  draftTitle = '';
  draftContent = '';
  private originalTitle = '';
  private originalContent = '';

  ngOnInit(): void { this.notas = this.loadNotes(); }

  get filteredNotes(): Nota[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    if (!query) return this.notas;
    return this.notas.filter(({ title, content }) => `${title} ${content}`.toLocaleLowerCase().includes(query));
  }

  get hasChanges(): boolean {
    return this.draftTitle.trim() !== this.originalTitle || this.draftContent !== this.originalContent;
  }

  openCreateEditor(): void {
    this.isCreating = true;
    this.editingId = null;
    this.setDraft('', '');
    this.isEditorOpen = true;
  }

  openEditEditor(nota: Nota): void {
    this.isCreating = false;
    this.editingId = nota.id;
    this.setDraft(nota.title, nota.content);
    this.isEditorOpen = true;
  }

  closeEditor(): void { this.isEditorOpen = false; }

  saveNote(): void {
    const title = this.draftTitle.trim();
    if (!title || !this.hasChanges) return;

    if (this.isCreating) {
      this.notas = [{ id: crypto.randomUUID(), title, content: this.draftContent, edited: new Date(), favourite: false, fixed: false }, ...this.notas];
    } else {
      this.notas = this.notas.map((nota) => nota.id === this.editingId ? { ...nota, title, content: this.draftContent, edited: new Date() } : nota);
    }
    this.persistNotes();
    this.closeEditor();
  }

  deleteNote(): void {
    if (this.isCreating || !this.editingId) return;
    this.notas = this.notas.filter((nota) => nota.id !== this.editingId);
    this.persistNotes();
    this.closeEditor();
  }

  toggleFavourite(nota: Nota, event: MouseEvent): void {
    event.stopPropagation();
    this.updateNote(nota.id, { favourite: !nota.favourite });
  }

  toggleFixed(nota: Nota, event: MouseEvent): void {
    event.stopPropagation();
    this.updateNote(nota.id, { fixed: !nota.fixed });
  }

  timeAgo(date: Date): string {
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 60) return `há ${Math.max(diffMin, 1)} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `há ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? 'ontem' : `há ${diffDays} dias`;
  }

  private setDraft(title: string, content: string): void {
    this.draftTitle = title;
    this.draftContent = content;
    this.originalTitle = title.trim();
    this.originalContent = content;
  }

  private updateNote(id: string, changes: Partial<Nota>): void {
    this.notas = this.notas.map((nota) => nota.id === id ? { ...nota, ...changes } : nota);
    this.persistNotes();
  }

  private loadNotes(): Nota[] {
    const savedNotes = localStorage.getItem(this.storageKey);
    if (savedNotes) {
      try { return JSON.parse(savedNotes).map((nota: Nota) => ({ ...nota, edited: new Date(nota.edited) })); }
      catch { localStorage.removeItem(this.storageKey); }
    }
    const initialNotes: Nota[] = [
      { id: crypto.randomUUID(), title: 'Nota 1', content: 'Texto da nota 1', edited: new Date(), favourite: false, fixed: false },
      { id: crypto.randomUUID(), title: 'Nota 2', content: 'Texto da nota 2', edited: new Date(), favourite: false, fixed: false },
    ];
    localStorage.setItem(this.storageKey, JSON.stringify(initialNotes));
    return initialNotes;
  }

  private persistNotes(): void { localStorage.setItem(this.storageKey, JSON.stringify(this.notas)); }
}
