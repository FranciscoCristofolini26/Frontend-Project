import { beforeEach, describe, expect, it } from 'vitest';
import { withoutId } from './api-client.service';
import { DemoDataStore } from './demo-data-store.service';

describe('data-access utilities', () => {
  beforeEach(() => localStorage.clear());

  it('removes the local identifier without mutating the original entity', () => {
    const entity = { id: 42, title: 'Item de teste' };

    expect(withoutId(entity)).toEqual({ title: 'Item de teste' });
    expect(entity).toEqual({ id: 42, title: 'Item de teste' });
  });

  it('stores and reuses one demo record for an empty resource', () => {
    const store = new DemoDataStore();
    const createItem = () => ({ id: 1, title: 'Exemplo' });

    expect(store.getOrCreateList('goals', createItem)).toEqual([{ id: 1, title: 'Exemplo' }]);
    expect(store.getOrCreateList('goals', () => ({ id: 2, title: 'Não deve substituir' }))).toEqual(
      [{ id: 1, title: 'Exemplo' }],
    );
  });
});
