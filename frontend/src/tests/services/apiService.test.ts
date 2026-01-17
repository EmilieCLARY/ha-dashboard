import { describe, it, expect } from 'vitest';
import { apiService } from '../services/api.service';
import type { HomeAssistantEntity } from '../services/api.service';

describe('API Service - Entity Filters', () => {
  const mockEntities: HomeAssistantEntity[] = [
    {
      entity_id: 'sensor.living_room_temperature',
      state: '22.5',
      attributes: {
        device_class: 'temperature',
        unit_of_measurement: '°C',
        friendly_name: 'Living Room Temperature',
      },
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
    },
    {
      entity_id: 'sensor.cpu_temperature',
      state: '45',
      attributes: {
        device_class: 'temperature',
        unit_of_measurement: '°C',
        friendly_name: 'CPU Temperature',
      },
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
    },
    {
      entity_id: 'sensor.humidity',
      state: '65',
      attributes: {
        device_class: 'humidity',
        unit_of_measurement: '%',
        friendly_name: 'Humidity',
      },
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
    },
    {
      entity_id: 'sensor.battery_level',
      state: '85',
      attributes: {
        device_class: 'battery',
        unit_of_measurement: '%',
        friendly_name: 'Battery Level',
      },
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
    },
    {
      entity_id: 'light.bedroom',
      state: 'on',
      attributes: {
        brightness: 200,
        friendly_name: 'Bedroom Light',
      },
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
    },
    {
      entity_id: 'sensor.power_consumption',
      state: '150',
      attributes: {
        device_class: 'power',
        unit_of_measurement: 'W',
        friendly_name: 'Power Consumption',
      },
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
    },
    {
      entity_id: 'weather.home',
      state: 'sunny',
      attributes: {
        temperature: 20,
        humidity: 50,
        friendly_name: 'Home Weather',
      },
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
    },
    {
      entity_id: 'sensor.cpu_usage',
      state: '45',
      attributes: {
        unit_of_measurement: '%',
        friendly_name: 'CPU Usage',
      },
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
    },
    {
      entity_id: 'sensor.memory_use_percent',
      state: '65',
      attributes: {
        unit_of_measurement: '%',
        friendly_name: 'Memory Usage',
      },
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
    },
  ];

  describe('getTemperatureSensors', () => {
    it('should return temperature sensors', () => {
      const sensors = apiService.getTemperatureSensors(mockEntities);
      expect(sensors).toHaveLength(1);
      expect(sensors[0].entity_id).toBe('sensor.living_room_temperature');
    });

    it('should exclude system temperature sensors', () => {
      const sensors = apiService.getTemperatureSensors(mockEntities);
      const systemSensor = sensors.find(s => s.entity_id === 'sensor.cpu_temperature');
      expect(systemSensor).toBeUndefined();
    });
  });

  describe('getHumiditySensors', () => {
    it('should return humidity sensors', () => {
      const sensors = apiService.getHumiditySensors(mockEntities);
      expect(sensors).toHaveLength(1);
      expect(sensors[0].entity_id).toBe('sensor.humidity');
    });
  });

  describe('getBatterySensors', () => {
    it('should return battery sensors', () => {
      const sensors = apiService.getBatterySensors(mockEntities);
      expect(sensors).toHaveLength(1);
      expect(sensors[0].entity_id).toBe('sensor.battery_level');
    });
  });

  describe('getLights', () => {
    it('should return light entities', () => {
      const lights = apiService.getLights(mockEntities);
      expect(lights).toHaveLength(1);
      expect(lights[0].entity_id).toBe('light.bedroom');
    });
  });

  describe('getEnergySensors', () => {
    it('should return energy/power sensors', () => {
      const sensors = apiService.getEnergySensors(mockEntities);
      expect(sensors).toHaveLength(1);
      expect(sensors[0].entity_id).toBe('sensor.power_consumption');
    });
  });

  describe('getWeatherEntities', () => {
    it('should return weather entities', () => {
      const weather = apiService.getWeatherEntities(mockEntities);
      expect(weather).toHaveLength(1);
      expect(weather[0].entity_id).toBe('weather.home');
    });
  });

  describe('getSystemSensors', () => {
    it('should return system sensors', () => {
      const sensors = apiService.getSystemSensors(mockEntities);
      expect(sensors.length).toBeGreaterThanOrEqual(3);
      
      const entityIds = sensors.map(s => s.entity_id);
      expect(entityIds).toContain('sensor.cpu_temperature');
      expect(entityIds).toContain('sensor.cpu_usage');
      expect(entityIds).toContain('sensor.memory_use_percent');
    });

    it('should not return non-system sensors', () => {
      const sensors = apiService.getSystemSensors(mockEntities);
      const nonSystemSensor = sensors.find(s => s.entity_id === 'sensor.living_room_temperature');
      expect(nonSystemSensor).toBeUndefined();
    });
  });
});
