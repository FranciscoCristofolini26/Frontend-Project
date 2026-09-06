import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ApiClient } from '../../../core/data-access/api-client.service';
import { WeatherResponse } from '../models/weather';
import { HomeDashboardService } from './home-dashboard.service';
import { WeatherService } from './weatherService.service';

describe('HomeDashboardService weather', () => {
  it('shows weather while other requests are pending and preserves it when they finish', () => {
    const pendingAvailability = new Subject();
    const weather = signal<WeatherResponse | null>(null);
    const load = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiClient, useValue: { getAll: () => of([]), get: () => pendingAvailability } },
        {
          provide: WeatherService,
          useValue: { weather, loading: signal(false), error: signal(null), load },
        },
      ],
    });
    const dashboardService = TestBed.inject(HomeDashboardService);
    dashboardService.load();
    weather.set({ temperature: 0, city: 'São Paulo', condition: 'Céu limpo' });

    expect(load).toHaveBeenCalledOnce();
    expect(dashboardService.dashboard().day.temperature).toBe('0 °C');
    expect(dashboardService.dashboard().day.city).toBe('São Paulo');
    expect(dashboardService.dashboard().day.weatherIcon).toBe('wb_sunny');

    pendingAvailability.error(new Error('Planner unavailable'));
    expect(dashboardService.dashboard().day.temperature).toBe('0 °C');
    expect(dashboardService.dashboard().day.weatherCondition).toBe('Céu limpo');
  });
});
