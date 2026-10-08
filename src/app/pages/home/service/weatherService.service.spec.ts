import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../../../core/data-access/api-client.service';
import { WeatherService } from './weatherService.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let http: HttpTestingController;
  const originalGeolocation = Object.getOwnPropertyDescriptor(navigator, 'geolocation');

  function mockGeolocation(denied = false) {
    const getCurrentPosition = vi.fn(
      (success: PositionCallback, failure: PositionErrorCallback) => {
        if (denied) {
          failure({ code: 1 } as GeolocationPositionError);
        } else {
          success({
            coords: { latitude: -23.5505, longitude: -46.6333 },
          } as GeolocationPosition);
        }
      },
    );
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    });
    return getCurrentPosition;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:8080/' },
      ],
    });
    service = TestBed.inject(WeatherService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
    if (originalGeolocation) {
      Object.defineProperty(navigator, 'geolocation', originalGeolocation);
    } else {
      Reflect.deleteProperty(navigator, 'geolocation');
    }
  });

  it('collects browser coordinates and stores weather without duplicate in-flight requests', () => {
    const geolocation = mockGeolocation();
    service.load();
    service.load();

    expect(geolocation).toHaveBeenCalledTimes(1);
    expect(service.loading()).toBe(true);
    const request = http.expectOne(
      'http://localhost:8080/weather?latitude=-23.5505&longitude=-46.6333',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ temperature: 0, city: 'São Paulo', condition: 'Céu limpo' });

    expect(service.weather()).toEqual({
      temperature: 0,
      city: 'São Paulo',
      condition: 'Céu limpo',
    });
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('rejects invalid coordinates before contacting the API', () => {
    let receivedError: Error | undefined;
    service.getWeather(Number.NaN, -46).subscribe({ error: (error) => (receivedError = error) });

    expect(receivedError?.message).toContain('coordenadas');
    http.expectNone(() => true);
  });

  it('rejects an incomplete API response instead of displaying fabricated weather', () => {
    mockGeolocation();
    service.load();
    http.expectOne(() => true).flush({ temperature: null, city: 'São Paulo' });

    expect(service.weather()).toBeNull();
    expect(service.error()).toContain('dados incompletos');
    expect(service.loading()).toBe(false);
  });

  it('reports denied location permission without an HTTP request', () => {
    mockGeolocation(true);
    service.load();

    expect(service.error()).toContain('Permita o acesso');
    expect(service.loading()).toBe(false);
    http.expectNone(() => true);
  });

  it('reports browsers without geolocation support', () => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined });
    service.load();

    expect(service.error()).toContain('não está disponível');
    expect(service.loading()).toBe(false);
    http.expectNone(() => true);
  });

  it('clears loading after an API failure and allows another attempt', () => {
    mockGeolocation();
    service.load();
    http.expectOne(() => true).flush({}, { status: 502, statusText: 'Bad Gateway' });

    expect(service.error()).toContain('Não foi possível consultar');
    expect(service.loading()).toBe(false);
    service.load();
    http.expectOne(() => true).flush({ temperature: 22, city: 'São Paulo', condition: 'Chuva' });
    expect(service.error()).toBeNull();
    expect(service.weather()?.temperature).toBe(22);
  });

  it('cancels a stalled weather request after the timeout', () => {
    vi.useFakeTimers();
    mockGeolocation();
    service.load();
    const request = http.expectOne(() => true);
    vi.advanceTimersByTime(15_001);

    expect(request.cancelled).toBe(true);
    expect(service.loading()).toBe(false);
    expect(service.error()).toContain('demorou para responder');
  });
});
