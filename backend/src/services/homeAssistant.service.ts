import WebSocket from 'ws';
import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

interface HAEvent {
  event_type: string;
  data: {
    entity_id?: string;
    new_state?: HAState;
    old_state?: HAState;
  };
  origin: string;
  time_fired: string;
}

export class HomeAssistantService extends EventEmitter {
  private static instance: HomeAssistantService;
  private ws: WebSocket | null = null;
  private httpClient: AxiosInstance;
  private messageId = 1;
  private reconnectInterval = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private subscriptions = new Map<number, (data: any) => void>();

  private constructor() {
    super();
    
    const haUrl = process.env.HA_URL || 'http://localhost:8123';
    const haToken = process.env.HA_TOKEN;

    if (!haToken) {
      throw new Error('HA_TOKEN environment variable is required');
    }

    // HTTP Client for REST API
    this.httpClient = axios.create({
      baseURL: haUrl,
      headers: {
        'Authorization': `Bearer ${haToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    logger.info(`HomeAssistant service initialized for ${haUrl}`);
  }

  public static getInstance(): HomeAssistantService {
    if (!HomeAssistantService.instance) {
      HomeAssistantService.instance = new HomeAssistantService();
    }
    return HomeAssistantService.instance;
  }

  /**
   * Connect to Home Assistant WebSocket API
   */
  public async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const haUrl = process.env.HA_URL || 'http://localhost:8123';
    const wsUrl = haUrl.replace(/^http/, 'ws') + '/api/websocket';
    const haToken = process.env.HA_TOKEN;

    logger.info(`Connecting to Home Assistant WebSocket: ${wsUrl}`);

    try {
      this.ws = new WebSocket(wsUrl, {
        rejectUnauthorized: false, // For self-signed certificates
      });

      this.ws.on('open', () => {
        logger.info('WebSocket connection opened');
        this.isConnecting = false;
      });

      this.ws.on('message', async (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(message, haToken!);
        } catch (error) {
          logger.error('Error parsing WebSocket message', error);
        }
      });

      this.ws.on('error', (error) => {
        logger.error('WebSocket error', error);
        this.isConnecting = false;
      });

      this.ws.on('close', () => {
        logger.warn('WebSocket connection closed, will attempt to reconnect...');
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect();
      });

    } catch (error) {
      logger.error('Failed to connect to Home Assistant WebSocket', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private async handleMessage(message: any, token: string): Promise<void> {
    // Initial auth_required message
    if (message.type === 'auth_required') {
      this.send({
        type: 'auth',
        access_token: token,
      });
      return;
    }

    // Auth successful
    if (message.type === 'auth_ok') {
      logger.info('✅ WebSocket authenticated successfully');
      this.emit('connected');
      
      // Subscribe to state changes
      await this.subscribeToEvents();
      return;
    }

    // Auth failed
    if (message.type === 'auth_invalid') {
      logger.error('❌ WebSocket authentication failed');
      this.emit('auth_failed');
      return;
    }

    // Result of a command
    if (message.type === 'result') {
      const callback = this.subscriptions.get(message.id);
      if (callback) {
        callback(message);
      }
      return;
    }

    // Event received
    if (message.type === 'event') {
      this.handleEvent(message.event);
    }
  }

  /**
   * Handle Home Assistant events
   */
  private handleEvent(event: HAEvent): void {
    // Emit state change events
    if (event.event_type === 'state_changed' && event.data.new_state) {
      this.emit('state_changed', {
        entity_id: event.data.entity_id,
        new_state: event.data.new_state,
        old_state: event.data.old_state,
      });
    }

    // Emit all events for listeners
    this.emit('event', event);
  }

  /**
   * Subscribe to state change events
   */
  private async subscribeToEvents(): Promise<void> {
    const id = this.getNextMessageId();
    
    this.subscriptions.set(id, (result) => {
      if (result.success) {
        logger.info('✅ Subscribed to state_changed events');
      } else {
        logger.error('❌ Failed to subscribe to events', result.error);
      }
    });

    this.send({
      id,
      type: 'subscribe_events',
      event_type: 'state_changed',
    });
  }

  /**
   * Send a message through WebSocket
   */
  private send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      logger.warn('Cannot send message, WebSocket is not connected');
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      logger.info('Attempting to reconnect to Home Assistant...');
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Get next message ID
   */
  private getNextMessageId(): number {
    return this.messageId++;
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    logger.info('Disconnected from Home Assistant');
  }

  // ===== REST API Methods =====

  /**
   * Get all states from Home Assistant
   */
  public async getStates(): Promise<HAState[]> {
    try {
      const response = await this.httpClient.get('/api/states');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch states from Home Assistant', error);
      throw error;
    }
  }

  /**
   * Get state of a specific entity
   */
  public async getState(entityId: string): Promise<HAState> {
    try {
      const response = await this.httpClient.get(`/api/states/${entityId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch state for ${entityId}`, error);
      throw error;
    }
  }

  /**
   * Call a Home Assistant service
   */
  public async callService(
    domain: string,
    service: string,
    serviceData?: Record<string, any>
  ): Promise<any> {
    try {
      const response = await this.httpClient.post(
        `/api/services/${domain}/${service}`,
        serviceData || {}
      );
      return response.data;
    } catch (error) {
      logger.error(`Failed to call service ${domain}.${service}`, error);
      throw error;
    }
  }

  /**
   * Get history for an entity
   */
  public async getHistory(
    entityId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<HAState[][]> {
    try {
      const params: any = {};
      if (startTime) {
        params.start_time = startTime.toISOString();
      }
      if (endTime) {
        params.end_time = endTime.toISOString();
      }

      const response = await this.httpClient.get(
        `/api/history/period${startTime ? '/' + startTime.toISOString() : ''}`,
        {
          params: {
            filter_entity_id: entityId,
            ...params,
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch history for ${entityId}`, error);
      throw error;
    }
  }

  /**
   * Test connection to Home Assistant
   */
  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/api/');
      logger.info('✅ Home Assistant connection test successful', response.data);
      return true;
    } catch (error) {
      logger.error('❌ Home Assistant connection test failed', error);
      return false;
    }
  }
}

export default HomeAssistantService.getInstance();
