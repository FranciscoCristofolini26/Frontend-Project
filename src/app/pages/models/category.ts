/**
 * Taxonomia compartilhada pelos módulos que classificam intenções e rotinas.
 * No backend, estes itens correspondem à entidade Category; no cliente, este
 * catálogo mantém os formulários alinhados enquanto a API não está conectada.
 */
export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const SHARED_CATEGORIES: readonly Category[] = [
  { id: 'trabalho', name: 'Trabalho', icon: 'work' },
  { id: 'estudo', name: 'Estudo', icon: 'school' },
  { id: 'saude', name: 'Saúde', icon: 'favorite' },
  { id: 'mente', name: 'Mente', icon: 'psychology' },
  { id: 'bem-estar', name: 'Bem-estar', icon: 'spa' },
  { id: 'pessoal', name: 'Pessoal', icon: 'person' },
  { id: 'projetos', name: 'Projetos', icon: 'folder' },
] as const;

export const CATEGORY_NAMES = SHARED_CATEGORIES.map((category) => category.name) as [
  Category['name'],
  ...Category['name'][],
];

export type CategoryName = (typeof CATEGORY_NAMES)[number];
