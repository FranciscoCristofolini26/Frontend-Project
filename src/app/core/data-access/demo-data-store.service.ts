import { Injectable } from '@angular/core';

const STORAGE_KEY = 'agenda.demo-data';

/**
 * Mantém somente dados de demonstração quando a API não retorna itens.
 * Todos os recursos usam a mesma chave do localStorage e cada um recebe apenas
 * um registro de exemplo, evitando que mocks extensos virem dados de produção.
 */
@Injectable({ providedIn: 'root' })
export class DemoDataStore {
  getOrCreateList<T>(resource: string, createItem: () => T): T[] {
    const storedData = this.read();
    const storedItems = storedData[resource];

    if (Array.isArray(storedItems) && storedItems.length > 0) {
      return storedItems as T[];
    }

    const demoItems = [createItem()];
    this.write({ ...storedData, [resource]: demoItems });
    return demoItems;
  }

  private read(): Record<string, unknown> {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (!value) return {};

      const parsedValue: unknown = JSON.parse(value);
      return parsedValue && typeof parsedValue === 'object'
        ? (parsedValue as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  private write(value: Record<string, unknown>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // A aplicação continua utilizável em navegadores com armazenamento indisponível.
    }
  }
}
