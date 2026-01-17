import { Redis } from 'ioredis';
import { logger } from '../utils/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

class CacheService {
  private client: Redis;
  private connected: boolean = false;

  constructor() {
    this.client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > 10) {
          logger.error('Redis: Too many reconnection attempts');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    this.client.on('error', (err: Error) => {
      logger.error('Redis error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      logger.info('📦 Redis client connected');
      this.connected = true;
    });

    this.client.on('ready', () => {
      logger.info('✅ Redis client ready');
    });

    this.client.on('reconnecting', () => {
      logger.warn('Redis client reconnecting...');
    });
  }

  async connect(): Promise<void> {
    // IORedis connects automatically
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.connected = false;
      logger.info('Redis client disconnected');
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Set a value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Failed to set cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Failed to delete cache key ${key}:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error(`Failed to delete keys matching pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Failed to check if key ${key} exists:`, error);
      return false;
    }
  }

  /**
   * Set expiration time for a key (in seconds)
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      logger.error(`Failed to set expiration for key ${key}:`, error);
    }
  }

  /**
   * Get TTL for a key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Failed to get TTL for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Failed to increment key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Store Home Assistant entity in cache
   */
  async cacheEntity(entityId: string, data: any, ttl: number = 300): Promise<void> {
    const key = `ha:entity:${entityId}`;
    await this.set(key, data, ttl);
  }

  /**
   * Get Home Assistant entity from cache
   */
  async getCachedEntity<T>(entityId: string): Promise<T | null> {
    const key = `ha:entity:${entityId}`;
    return await this.get<T>(key);
  }

  /**
   * Invalidate entity cache
   */
  async invalidateEntity(entityId: string): Promise<void> {
    const key = `ha:entity:${entityId}`;
    await this.del(key);
  }

  /**
   * Cache all entities
   */
  async cacheAllEntities(entities: any[], ttl: number = 300): Promise<void> {
    const key = 'ha:entities:all';
    await this.set(key, entities, ttl);
  }

  /**
   * Get all cached entities
   */
  async getAllCachedEntities<T>(): Promise<T[] | null> {
    const key = 'ha:entities:all';
    return await this.get<T[]>(key);
  }

  /**
   * Invalidate all entities cache
   */
  async invalidateAllEntities(): Promise<void> {
    await this.delPattern('ha:entity:*');
    await this.del('ha:entities:all');
  }

  /**
   * Store session data
   */
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, data, ttl);
  }

  /**
   * Get session data
   */
  async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    return await this.get<T>(key);
  }

  /**
   * Delete session
   */
  async delSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.del(key);
  }
}

export const cacheService = new CacheService();
