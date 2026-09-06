import { WeatherResponse } from '../models/weather';

export class WeatherValidator {
  static validateCoordinates(latitude: number, longitude: number): void {
    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error('As coordenadas recebidas são inválidas.');
    }
  }

  static validateResponse(value: unknown): WeatherResponse {
    if (typeof value !== 'object' || value === null) {
      throw new Error('O serviço de clima retornou uma resposta inválida.');
    }

    const data = value as Partial<WeatherResponse>;
    if (
      typeof data.temperature !== 'number' ||
      !Number.isFinite(data.temperature) ||
      typeof data.city !== 'string' ||
      !data.city.trim() ||
      typeof data.condition !== 'string' ||
      !data.condition.trim()
    ) {
      throw new Error('O serviço de clima retornou dados incompletos.');
    }

    return {
      temperature: data.temperature,
      city: data.city.trim(),
      condition: data.condition.trim(),
    };
  }
}
