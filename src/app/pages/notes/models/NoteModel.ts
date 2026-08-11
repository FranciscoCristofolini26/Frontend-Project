export interface NoteModel {
  id: number;
  title: string;
  description: string;
  edited: Date;
  favourite?: boolean;
  fixed?: boolean;
  fixedAt?: Date | null;
}
