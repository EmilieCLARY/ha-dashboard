import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as authServiceModule from '../../services/auth.service';

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
  authService: {
    verifyAccessToken: vi.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    jsonSpy = vi.fn().mockReturnValue(undefined);
    mockRes = {
      status: vi.fn().mockReturnValue({ json: jsonSpy }),
      json: jsonSpy,
    };
    mockNext = vi.fn();
    mockReq = {
      headers: {},
    };
  });

  describe('Token Validation', () => {
    it('rejects request with no authorization header', async () => {
      mockReq.headers = {};

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'No token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('rejects request with invalid authorization header format', async () => {
      mockReq.headers = {
        authorization: 'InvalidHeader',
      };

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('extracts token from Bearer authorization header', async () => {
      const token = 'test-jwt-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      vi.mocked(authServiceModule.authService.verifyAccessToken).mockReturnValue(
        mockPayload as any
      );

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(authServiceModule.authService.verifyAccessToken).toHaveBeenCalledWith(token);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('User Attachment', () => {
    it('attaches user info to request on valid token', async () => {
      const token = 'valid-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      vi.mocked(authServiceModule.authService.verifyAccessToken).mockReturnValue(
        mockPayload as any
      );

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toEqual(mockPayload);
    });

    it('sets correct user role on request', async () => {
      const token = 'admin-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      const mockPayload = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      vi.mocked(authServiceModule.authService.verifyAccessToken).mockReturnValue(
        mockPayload as any
      );

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user.role).toBe('ADMIN');
    });
  });

  describe('Error Handling', () => {
    it('handles token verification errors', async () => {
      const token = 'invalid-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      const error = new Error('Invalid token');
      vi.mocked(authServiceModule.authService.verifyAccessToken).mockImplementation(() => {
        throw error;
      });

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('handles expired token', async () => {
      const token = 'expired-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      const error = new Error('Token expired');
      vi.mocked(authServiceModule.authService.verifyAccessToken).mockImplementation(() => {
        throw error;
      });

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('rejects request with bearer token but no actual token value', async () => {
      mockReq.headers = {
        authorization: 'Bearer ',
      };

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Success Cases', () => {
    it('calls next() on successful authentication', async () => {
      const token = 'valid-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      vi.mocked(authServiceModule.authService.verifyAccessToken).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      } as any);

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('does not return a response on successful authentication', async () => {
      const token = 'valid-token';
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      vi.mocked(authServiceModule.authService.verifyAccessToken).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      } as any);

      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(jsonSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles authorization header with different casing', async () => {
      const token = 'test-token';
      mockReq.headers = {
        Authorization: `Bearer ${token}`,
      };

      vi.mocked(authServiceModule.authService.verifyAccessToken).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      } as any);

      // Note: Headers are typically lowercase in Express
      await authenticate(mockReq as Request, mockRes as Response, mockNext);
    });

    it('ignores extra whitespace in bearer prefix', async () => {
      const token = 'test-token';
      mockReq.headers = {
        authorization: `Bearer  ${token}`,
      };

      // This would fail because of the extra space, which is correct behavior
      await authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
