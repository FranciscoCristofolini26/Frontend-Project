import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type ResourceId = number | string;

/** Cria o corpo de POST/PUT sem enviar a chave primária gerada no cliente. */
export function withoutId<T extends { id: ResourceId }>(entity: T): Omit<T, 'id'> {
  const payload = { ...entity };
  Reflect.deleteProperty(payload, 'id');
  return payload as Omit<T, 'id'>;
}

/** Base da API. Pode ser substituída nos providers ao criar ambientes distintos. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => 'http://localhost:8080',
});

/**
 * Cliente HTTP único para os recursos da aplicação.
 *
 * Os serviços de cada feature mantêm apenas as regras do seu domínio e usam esta
 * classe para as quatro operações CRUD. Assim a URL do backend não fica repetida
 * em cada componente.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');

  getAll<T>(resource: string): Observable<T[]> {
    return this.http.get<T[]>(this.url(resource));
  }

  getById<T>(resource: string, id: ResourceId): Observable<T> {
    return this.http.get<T>(this.url(resource, id));
  }

  post<TResponse, TBody>(resource: string, body: TBody): Observable<TResponse> {
    return this.http.post<TResponse>(this.url(resource), body);
  }

  put<TResponse, TBody>(resource: string, id: ResourceId, body: TBody): Observable<TResponse> {
    return this.http.put<TResponse>(this.url(resource, id), body);
  }

  delete(resource: string, id: ResourceId): Observable<void> {
    return this.http.delete<void>(this.url(resource, id));
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.url(path));
  }

  private url(resource: string, id?: ResourceId): string {
    const normalizedResource = resource.replace(/^\/+|\/+$/g, '');
    const resourceUrl = `${this.baseUrl}/${normalizedResource}`;
    return id === undefined ? resourceUrl : `${resourceUrl}/${encodeURIComponent(String(id))}`;
  }
}
