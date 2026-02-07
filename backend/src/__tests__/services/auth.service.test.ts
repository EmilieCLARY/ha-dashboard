import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authService } from '../../services/auth.service';
import * as dbModule from '../../config/database';

// Mock dependencies
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('hashes password successfully', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashed_value';

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);

      const result = await authService.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('verifies correct password', async () => {
      const password = 'testPassword123';
      const hash = 'hashed_value';

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.verifyPassword(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('rejects incorrect password', async () => {
      const password = 'testPassword123';
      const hash = 'hashed_value';

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await authService.verifyPassword(password, hash);

      expect(result).toBe(false);
    });

    it('handles hashing errors', async () => {
      const password = 'testPassword123';
      const error = new Error('Hashing failed');

      vi.mocked(bcrypt.hash).mockRejectedValue(error);

      await expect(authService.hashPassword(password)).rejects.toThrow('Hashing failed');
    });
  });

  describe('JWT Token Generation', () => {
    it('generates access token with correct payload', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER' as const,
      };
      const token = 'jwt_access_token';

      vi.mocked(jwt.sign).mockReturnValue(token);

      const result = authService.generateAccessToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), {
        expiresIn: expect.any(String),
      });
      expect(result).toBe(token);
    });

    it('generates refresh token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER' as const,
      };
      const token = 'jwt_refresh_token';

      vi.mocked(jwt.sign).mockReturnValue(token);

      const result = authService.generateRefreshToken(payload);

      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toBe(token);
    });
  });

  describe('JWT Token Verification', () => {
    it('verifies valid access token', () => {
      const token = 'valid_token';
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      vi.mocked(jwt.verify).mockReturnValue(payload as never);

      const result = authService.verifyAccessToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(result).toEqual(payload);
    });

    it('rejects invalid token', () => {
      const token = 'invalid_token';
      const error = new Error('Invalid token');

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw error;
      });

      expect(() => authService.verifyAccessToken(token)).toThrow('Invalid token');
    });

    it('verifies valid refresh token', () => {
      const token = 'valid_refresh_token';
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      vi.mocked(jwt.verify).mockReturnValue(payload as never);

      const result = authService.verifyRefreshToken(token);

      expect(jwt.verify).toHaveBeenCalled();
      expect(result).toEqual(payload);
    });
  });

  describe('User Registration', () => {
    it('registers new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const hashedPassword = 'hashed_password';
      const newUser = {
        id: 'user-123',
        email: userData.email,
        name: userData.name,
        role: 'USER',
      };

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.mocked(dbModule.prisma.user.create).mockResolvedValue(newUser as any);

      const result = await authService.register(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(dbModule.prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ user: newUser }));
    });

    it('prevents duplicate email registration', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const error = new Error('User already exists');
      vi.mocked(dbModule.prisma.user.create).mockRejectedValue(error);

      await expect(authService.register(userData)).rejects.toThrow('User already exists');
    });

    it('generates tokens on successful registration', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashed_password';
      const newUser = {
        id: 'user-123',
        email: userData.email,
        role: 'USER',
      };

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.mocked(dbModule.prisma.user.create).mockResolvedValue(newUser as any);
      vi.mocked(jwt.sign).mockReturnValue('token' as never);

      const result = await authService.register(userData);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('User Login', () => {
    it('logs in user with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 'user-123',
        email: loginData.email,
        password: 'hashed_password',
        role: 'USER',
      };

      vi.mocked(dbModule.prisma.user.findUnique).mockResolvedValue(user as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('token' as never);

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('rejects login with wrong password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const user = {
        id: 'user-123',
        email: loginData.email,
        password: 'hashed_password',
        role: 'USER',
      };

      vi.mocked(dbModule.prisma.user.findUnique).mockResolvedValue(user as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(authService.login(loginData)).rejects.toThrow();
    });

    it('rejects login with nonexistent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      vi.mocked(dbModule.prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow();
    });
  });

  describe('Token Refresh', () => {
    it('generates new access token from refresh token', () => {
      const refreshToken = 'valid_refresh_token';
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      vi.mocked(jwt.verify).mockReturnValue(payload as never);
      vi.mocked(jwt.sign).mockReturnValue('new_access_token' as never);

      const result = authService.refreshAccessToken(refreshToken);

      expect(jwt.verify).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toBe('new_access_token');
    });

    it('rejects invalid refresh token', () => {
      const refreshToken = 'invalid_refresh_token';
      const error = new Error('Invalid refresh token');

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw error;
      });

      expect(() => authService.refreshAccessToken(refreshToken)).toThrow();
    });
  });
});
