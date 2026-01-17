import axios, { AxiosInstance } from 'axios';
import type { HomeAssistantEntity, APIResponse, EntitiesResponse } from '../types/homeAssistant';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface HistoryDataPoint {
  state: string;
  last_changed: string;
  attributes: Record<string, any>;
}

interface HistoryResponse {
  success: boolean;
  entity_id: string;
  period: {
    start: string;
    end: string;
  };
  data: HistoryDataPoint[];
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Get all entities
  async getEntities(): Promise<HomeAssistantEntity[]> {
    const response = await this.client.get<EntitiesResponse>('/api/entities');
    return response.data.data;
  }

  // Get specific entity
  async getEntity(entityId: string): Promise<HomeAssistantEntity> {
    const response = await this.client.get<APIResponse<HomeAssistantEntity>>(`/api/entities/${entityId}`);
    return response.data.data;
  }

  // Get entity history
  async getEntityHistory(
    entityId: string,
    start?: Date,
    end?: Date
  ): Promise<HistoryResponse> {
    const params: Record<string, string> = {};
    if (start) params.start = start.toISOString();
    if (end) params.end = end.toISOString();

    const response = await this.client.get<HistoryResponse>(
      `/api/entities/${entityId}/history`,
      { params }
    );
    return response.data;
  }

  // Call a service
  async callService(
    domain: string,
    service: string,
    serviceData?: Record<string, any>
  ): Promise<any> {
    const response = await this.client.post(
      `/api/services/${domain}/${service}`,
      serviceData || {}
    );
    return response.data;
  }

  // Filter entities by domain
  filterEntitiesByDomain(entities: HomeAssistantEntity[], domain: string): HomeAssistantEntity[] {
    return entities.filter((entity) => entity.entity_id.startsWith(`${domain}.`));
  }

  // Helper to check if entity is a system sensor
  private isSystemSensor(entity: HomeAssistantEntity): boolean {
    const entityId = entity.entity_id.toLowerCase();
    return (
      entityId.includes('system') ||
      entityId.includes('cpu') ||
      entityId.includes('processor') ||
      entityId.includes('memory') ||
      entityId.includes('ram') ||
      entityId.includes('disk') ||
      entityId.includes('storage') ||
      entityId.includes('load_') ||
      entityId.includes('swap') ||
      (entityId.includes('network') && entityId.includes('bytes'))
    );
  }

  // Get temperature sensors (excluding system sensors)
  getTemperatureSensors(entities: HomeAssistantEntity[]): HomeAssistantEntity[] {
    return entities.filter(
      (entity) =>
        (entity.attributes.device_class === 'temperature' ||
        entity.entity_id.includes('temperature')) &&
        !this.isSystemSensor(entity)
    );
  }

  // Get humidity sensors
  getHumiditySensors(entities: HomeAssistantEntity[]): HomeAssistantEntity[] {
    return entities.filter(
      (entity) =>
        entity.attributes.device_class === 'humidity' ||
        entity.entity_id.includes('humidity')
    );
  }

  // Get battery sensors
  getBatterySensors(entities: HomeAssistantEntity[]): HomeAssistantEntity[] {
    return entities.filter(
      (entity) =>
        entity.attributes.device_class === 'battery' ||
        entity.entity_id.includes('battery')
    );
  }

  // Get lights
  getLights(entities: HomeAssistantEntity[]): HomeAssistantEntity[] {
    return this.filterEntitiesByDomain(entities, 'light');
  }

  // Get switches
  getSwitches(entities: HomeAssistantEntity[]): HomeAssistantEntity[] {
    return this.filterEntitiesByDomain(entities, 'switch');
  }

  // Get energy/power sensors
  getEnergySensors(entities: HomeAssistantEntity[]): HomeAssistantEntity[] {
    return entities.filter(
      (entity) =>
        entity.attributes.device_class === 'power' ||
        entity.attributes.device_class === 'energy' ||
        entity.entity_id.includes('power') ||
        entity.entity_id.includes('energy') ||
        entity.entity_id.includes('consumption')
    );
  }

  // Get weather entities
  getWeatherEntities(entities: HomeAssistantEntity[]): HomeAssistantEntity[] {
    return this.filterEntitiesByDomain(entities, 'weather');
  }

  // Get system monitor sensors
  getSystemSensors(entities: HomeAssistantEntity[]): HomeAssistantEntity[] {
    return entities.filter(
      (entity) =>
        entity.entity_id.includes('system') ||
        entity.entity_id.includes('cpu') ||
        entity.entity_id.includes('memory') ||
        entity.entity_id.includes('disk')
    );
  }
}

export const apiService = new ApiService();
export type { HomeAssistantEntity, HistoryDataPoint, HistoryResponse };
