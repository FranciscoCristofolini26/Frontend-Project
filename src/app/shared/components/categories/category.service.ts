import { Injectable, signal } from '@angular/core';
import { Category } from './category';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'trabalho', name: 'Trabalho', icon: 'work' },
  { id: 'estudo', name: 'Estudo', icon: 'auto_stories' },
  { id: 'saude', name: 'Saúde', icon: 'health_and_safety' },
  { id: 'mente', name: 'Mente', icon: 'psychology' },
  { id: 'bem-estar', name: 'Bem-estar', icon: 'spa' },
  { id: 'pessoal', name: 'Pessoal', icon: 'person' },
  { id: 'projetos', name: 'Projetos', icon: 'folder' },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  readonly categories = signal<Category[]>(DEFAULT_CATEGORIES);
}
