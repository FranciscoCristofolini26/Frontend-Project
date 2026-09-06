import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, TimeoutError, defer, finalize, map, switchMap, timeout } from 'rxjs';
import { ApiClient } from '../../../core/data-access/api-client.service';
import { WeatherResponse } from '../models/weather';
import { WeatherValidator } from '../validation/weather.validator';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly api = inject(ApiClient);
  private readonly weatherState = signal<WeatherResponse | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly weather = this.weatherState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  getWeather(latitude: number, longitude: number): Observable<WeatherResponse> {
    return defer(() => {
      WeatherValidator.validateCoordinates(latitude, longitude);
      const params = new HttpParams().set('latitude', latitude).set('longitude', longitude);
      return this.api.get<unknown>(`weather?${params.toString()}`);
    }).pipe(timeout(15_000), map(WeatherValidator.validateResponse));
  }

  getWeatherForCurrentLocation(): Observable<WeatherResponse> {
    return new Observable<GeolocationCoordinates>((subscriber) => {
      const geolocation = globalThis.navigator?.geolocation;
      if (!geolocation) {
        subscriber.error(new Error('A localização não está disponível neste navegador.'));
        return;
      }

      geolocation.getCurrentPosition(
        ({ coords }) => {
          subscriber.next(coords);
          subscriber.complete();
        },
        (error) => {
          const message =
            error.code === 1
              ? 'Permita o acesso à localização no navegador para consultar o clima.'
              : error.code === 3
                ? 'A localização demorou para responder. Tente novamente.'
                : 'Não foi possível obter sua localização.';
          subscriber.error(new Error(message));
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
      );
    }).pipe(switchMap(({ latitude, longitude }) => this.getWeather(latitude, longitude)));
  }

  load(): void {
    if (this.loadingState()) return;

    this.loadingState.set(true);
    this.errorState.set(null);
    this.weatherState.set(null);

    this.getWeatherForCurrentLocation()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (weather) => this.weatherState.set(weather),
        error: (error: unknown) => {
          this.errorState.set(
            error instanceof HttpErrorResponse
              ? 'Não foi possível consultar o clima. Tente novamente mais tarde.'
              : error instanceof TimeoutError
                ? 'A consulta do clima demorou para responder. Tente novamente.'
                : error instanceof Error
                  ? error.message
                  : 'Não foi possível carregar o clima.',
          );
        },
      });
  }
}
