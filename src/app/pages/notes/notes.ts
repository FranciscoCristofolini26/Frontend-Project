import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NoteModel } from './models/NoteModel';
import { NoteService } from './service/NoteService';

@Component({
  selector: 'app-notes',
  imports: [FormsModule, MatIconModule],
  templateUrl: './notes.html',
  styleUrls: ['./notes.css'],
})
export class Notes implements OnInit {
  private noteService = inject(NoteService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  readonly notePreviewMaxLength = 180;
  notas: NoteModel[] = [];
  searchTerm = '';
  isEditorOpen = false;
  isCreating = false;
  editingId: number | null = null;
  draftTitle = '';
  draftContent = '';
  private originalTitle = '';
  private originalContent = '';

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.noteService.getNotes().subscribe({
      next: (data) => {
        // Converte as strings de data recebidas do JSON para objetos Date

        this.notas = data.map(nota => ({
          ...nota,
          edited: nota.edited ? new Date(nota.edited) : new Date(),
          fixedAt: nota.fixedAt ? new Date(nota.fixedAt) : null
        }));
        this.changeDetectorRef.detectChanges();

      },
      error: (err) => console.error('Erro ao carregar notas:', err)
    });
  }

  private setDraft(title: string, content: string): void {
    this.draftTitle = title;
    this.draftContent = content;
    this.originalTitle = title.trim();
    this.originalContent = content;
  }

  get filteredNotes(): NoteModel[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    const notes = !query
      ? this.notas
      : this.notas.filter(({ title, description }) =>
          `${title} ${description}`.toLocaleLowerCase().includes(query)
        );

    return [...notes].sort((first, second) => {
      if (first.fixed !== second.fixed) return first.fixed ? -1 : 1;
      if (!first.fixed) return 0;
      return (
        (first.fixedAt?.getTime() ?? Number.MAX_SAFE_INTEGER) -
        (second.fixedAt?.getTime() ?? Number.MAX_SAFE_INTEGER)
      );
    });
  }

  get hasChanges(): boolean {
    return (
      this.draftTitle.trim() !== this.originalTitle || this.draftContent !== this.originalContent
    );
  }

  openCreateEditor(): void {
    this.isCreating = true;
    this.editingId = null;
    this.setDraft('', '');
    this.isEditorOpen = true;
  }

  openEditEditor(nota: NoteModel): void {
    if (nota.id === undefined) return;
    this.isCreating = false;
    this.editingId = nota.id;
    this.setDraft(nota.title, nota.description);
    this.isEditorOpen = true;
  }

  closeEditor(): void {
    this.isEditorOpen = false;
  }

  closeFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeEditor();
    }
  }

  saveNote(): void {
    const title = this.draftTitle.trim();
    if (!title || !this.hasChanges) return;

    if (this.isCreating) {
      const newNote: Partial<NoteModel> = {
        title,
        description: this.draftContent,
        edited: new Date(),
        favourite: false,
        fixed: false,
        fixedAt: null,
      };

      this.noteService.createNote(newNote).subscribe(() => {
        this.loadNotes();
        this.closeEditor();
      });

    } else if (this.editingId !== null) {
      const updatedData: Partial<NoteModel> = {
        title,
        description: this.draftContent,
        edited: new Date(),
      };

      this.noteService.updateNote(this.editingId, updatedData).subscribe(() => {
        this.loadNotes();
        this.closeEditor();
      });
    }
  }

  deleteNote(): void {
    if (this.isCreating || this.editingId === null) return;

    this.noteService.deleteNote(this.editingId).subscribe(() => {
      this.loadNotes();
      this.closeEditor();
    });
  }

  toggleFavourite(nota: NoteModel, event: MouseEvent): void {
    event.stopPropagation();
    if (nota.id === undefined) return;
    this.noteService.updateNote(nota.id, { favourite: !nota.favourite }).subscribe(() => {
      this.loadNotes();
    });
  }

  toggleFixed(nota: NoteModel, event: MouseEvent): void {
    event.stopPropagation();
    if (nota.id === undefined) return;
    const fixed = !nota.fixed;
    const fixedAt = fixed ? new Date() : null;

    this.noteService.updateNote(nota.id, { fixed, fixedAt }).subscribe(() => {
      this.loadNotes();
    });
  }

  timeAgo(date: Date | null | undefined): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 60) return `há ${Math.max(diffMin, 1)} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `há ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? 'ontem' : `há ${diffDays} dias`;
  }

  previewContent(content: string): string {
    const normalizedContent = content.replace(/\s+/g, ' ').trim();

    return normalizedContent.length > this.notePreviewMaxLength
      ? `${normalizedContent.slice(0, this.notePreviewMaxLength).trimEnd()}...`
      : normalizedContent;
  }
}
