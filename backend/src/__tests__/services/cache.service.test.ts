import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Redis } from 'ioredis';
import { cacheService } from '../../services/cache.service';

// Mock ioredis
vi.mock('ioredis', () => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    ttl: vi.fn(),
    expire: vi.fn(),
    setex: vi.fn(),
    keys: vi.fn(),
    flushdb: vi.fn(),
    quit: vi.fn(),
    on: vi.fn(),
  };

  return {
    Redis: vi.fn(() => mockRedis),
  };
});

describe('Cache Service', () => {
  let mockRedis: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Get the mocked Redis instance
    mockRedis = new Redis();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection', () => {
    it('initializes Redis connection', async () => {
      await cacheService.connect();
      // Connection is automatic with ioredis
      expect(Redis).toHaveBeenCalled();
    });

    it('checks connection status', () => {
      const isConnected = cacheService.isConnected();
      expect(typeof isConnected).toBe('boolean');
    });

    it('disconnects from Redis', async () => {
      mockRedis.quit.mockResolvedValue('OK');
      await cacheService.disconnect();
      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });

  describe('Get/Set Operations', () => {
    it('sets a cache value', async () => {
      const key = 'test:key';
      const value = { id: 1, name: 'Test' };

      mockRedis.set.mockResolvedValue('OK');

      await cacheService.set(key, value, 60);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        key,
        60,
        JSON.stringify(value)
      );
    });

    it('gets a cached value', async () => {
      const key = 'test:key';
      const value = { id: 1, name: 'Test' };
      const cachedValue = JSON.stringify(value);

      mockRedis.get.mockResolvedValue(cachedValue);

      const result = await cacheService.get(key);

      expect(mockRedis.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it('returns null for non-existent key', async () => {
      const key = 'nonexistent:key';
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
    });

    it('handles JSON parsing error', async () => {
      const key = 'invalid:json';
      mockRedis.get.mockResolvedValue('invalid json');

      const result = await cacheService.get(key);

      expect(result).toBeNull();
    });
  });

  describe('Delete Operations', () => {
    it('deletes a cache key', async () => {
      const key = 'test:key';
      mockRedis.del.mockResolvedValue(1);

      await cacheService.del(key);

      expect(mockRedis.del).toHaveBeenCalledWith(key);
    });

    it('returns deleted count', async () => {
      const keys = ['key1', 'key2'];
      mockRedis.del.mockResolvedValue(2);

      await cacheService.del(...keys);

      expect(mockRedis.del).toHaveBeenCalledWith(...keys);
    });

    it('handles deletion of non-existent key', async () => {
      const key = 'nonexistent:key';
      mockRedis.del.mockResolvedValue(0);

      await cacheService.del(key);

      expect(mockRedis.del).toHaveBeenCalledWith(key);
    });
  });

  describe('Expiration', () => {
    it('sets cache expiration time', async () => {
      const key = 'test:key';
      const ttl = 300;

      mockRedis.expire.mockResolvedValue(1);

      await cacheService.expire(key, ttl);

      expect(mockRedis.expire).toHaveBeenCalledWith(key, ttl);
    });

    it('gets time to live for a key', async () => {
      const key = 'test:key';
      mockRedis.ttl.mockResolvedValue(300);

      const result = await cacheService.ttl(key);

      expect(mockRedis.ttl).toHaveBeenCalledWith(key);
      expect(result).toBe(300);
    });

    it('returns -1 for key without expiration', async () => {
      const key = 'persistent:key';
      mockRedis.ttl.mockResolvedValue(-1);

      const result = await cacheService.ttl(key);

      expect(result).toBe(-1);
    });

    it('returns -2 for non-existent key', async () => {
      const key = 'nonexistent:key';
      mockRedis.ttl.mockResolvedValue(-2);

      const result = await cacheService.ttl(key);

      expect(result).toBe(-2);
    });
  });

  describe('Key Existence', () => {
    it('checks if key exists', async () => {
      const key = 'test:key';
      mockRedis.exists.mockResolvedValue(1);

      const result = await cacheService.exists(key);

      expect(mockRedis.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it('returns false for non-existent key', async () => {
      const key = 'nonexistent:key';
      mockRedis.exists.mockResolvedValue(0);

      const result = await cacheService.exists(key);

      expect(result).toBe(false);
    });
  });

  describe('Pattern Operations', () => {
    it('finds keys matching pattern', async () => {
      const pattern = 'entities:*';
      const keys = ['entities:temp', 'entities:humidity'];

      mockRedis.keys.mockResolvedValue(keys);

      const result = await cacheService.keys(pattern);

      expect(mockRedis.keys).toHaveBeenCalledWith(pattern);
      expect(result).toEqual(keys);
    });

    it('handles no matches for pattern', async () => {
      const pattern = 'nonexistent:*';
      mockRedis.keys.mockResolvedValue([]);

      const result = await cacheService.keys(pattern);

      expect(result).toEqual([]);
    });

    it('clears all cache', async () => {
      mockRedis.flushdb.mockResolvedValue('OK');

      await cacheService.flush();

      expect(mockRedis.flushdb).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('sets session with expiration', async () => {
      const sessionId = 'session:abc123';
      const sessionData = {
        userId: 'user-123',
        username: 'testuser',
      };
      const ttl = 3600;

      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.setSession(sessionId, sessionData, ttl);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        sessionId,
        ttl,
        JSON.stringify(sessionData)
      );
    });

    it('retrieves session', async () => {
      const sessionId = 'session:abc123';
      const sessionData = {
        userId: 'user-123',
        username: 'testuser',
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));

      const result = await cacheService.getSession(sessionId);

      expect(result).toEqual(sessionData);
    });

    it('deletes session', async () => {
      const sessionId = 'session:abc123';
      mockRedis.del.mockResolvedValue(1);

      await cacheService.deleteSession(sessionId);

      expect(mockRedis.del).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('Error Handling', () => {
    it('handles Redis connection errors', async () => {
      const error = new Error('Redis connection failed');
      mockRedis.get.mockRejectedValue(error);

      await expect(cacheService.get('key')).rejects.toThrow();
    });

    it('handles set operation errors', async () => {
      const error = new Error('Set operation failed');
      mockRedis.setex.mockRejectedValue(error);

      await expect(
        cacheService.set('key', { data: 'value' }, 60)
      ).rejects.toThrow();
    });
  });

  describe('Multiple Operations', () => {
    it('handles multiple keys in get operation', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const values = [
        JSON.stringify({ id: 1 }),
        JSON.stringify({ id: 2 }),
        JSON.stringify({ id: 3 }),
      ];

      keys.forEach((key, index) => {
        mockRedis.get.mockResolvedValueOnce(values[index]);
      });

      const result = await Promise.all(keys.map(k => cacheService.get(k)));

      expect(result).toHaveLength(3);
    });

    it('handles pattern deletion', async () => {
      const pattern = 'entities:*';
      const keysToDelete = ['entities:temp', 'entities:humidity'];

      mockRedis.keys.mockResolvedValue(keysToDelete);
      mockRedis.del.mockResolvedValue(2);

      const keys = await cacheService.keys(pattern);
      await cacheService.del(...keys);

      expect(mockRedis.keys).toHaveBeenCalledWith(pattern);
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });
});
