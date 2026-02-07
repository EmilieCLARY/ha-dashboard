import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middleware/errorHandler';
import * as loggerModule from '../../utils/logger';

// Mock the logger
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    jsonSpy = vi.fn();
    mockRes = {
      status: vi.fn().mockReturnValue({ json: jsonSpy }),
      statusCode: 200,
    };
    mockNext = vi.fn();
    mockReq = {
      path: '/api/test',
      method: 'GET',
    };

    process.env.NODE_ENV = 'production';
  });

  describe('Error Logging', () => {
    it('logs error details', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at test.ts:10';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(loggerModule.logger.error).toHaveBeenCalledWith('Error:', {
        message: 'Test error',
        stack: error.stack,
        path: '/api/test',
        method: 'GET',
      });
    });

    it('includes request path and method in log', () => {
      mockReq.path = '/api/entities';
      mockReq.method = 'POST';

      const error = new Error('Entity not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(loggerModule.logger.error).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          path: '/api/entities',
          method: 'POST',
        })
      );
    });
  });

  describe('Error Response', () => {
    it('responds with error message', () => {
      const error = new Error('Test error message');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalled();
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error message',
          }),
        })
      );
    });

    it('uses custom status code if set on response', () => {
      (mockRes as any).statusCode = 404;
      const error = new Error('Not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('defaults to 500 status code if statusCode is 200', () => {
      mockRes.statusCode = 200;
      const error = new Error('Server error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('uses statusCode from response if not 200', () => {
      mockRes.statusCode = 403;
      const error = new Error('Forbidden');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Development vs Production Mode', () => {
    it('includes stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error');
      error.stack = 'Stack trace here';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Dev error',
            stack: 'Stack trace here',
          }),
        })
      );
    });

    it('excludes stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Prod error');
      error.stack = 'Stack trace should not be included';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const responseBody = jsonSpy.mock.calls[0][0];
      expect(responseBody.error.stack).toBeUndefined();
    });

    it('always includes error message regardless of environment', () => {
      const error = new Error('Important message');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Important message',
          }),
        })
      );
    });
  });

  describe('Multiple Errors', () => {
    it('handles errors with different types', () => {
      const errors = [
        new Error('Type error'),
        new Error('Validation error'),
        new Error('Database error'),
      ];

      errors.forEach((error) => {
        jsonSpy.mockClear();
        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(jsonSpy).toHaveBeenCalled();
      });
    });

    it('logs each error separately', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      errorHandler(error1, mockReq as Request, mockRes as Response, mockNext);
      errorHandler(error2, mockReq as Request, mockRes as Response, mockNext);

      expect(loggerModule.logger.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('Response Format', () => {
    it('returns JSON formatted error response', () => {
      const error = new Error('Formatted error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const callArgs = jsonSpy.mock.calls[0][0];
      expect(callArgs).toHaveProperty('error');
      expect(callArgs.error).toHaveProperty('message');
    });

    it('error response has consistent structure', () => {
      const error = new Error('Structured error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const responseBody = jsonSpy.mock.calls[0][0];
      expect(typeof responseBody).toBe('object');
      expect(Object.keys(responseBody)).toContain('error');
    });
  });

  describe('Edge Cases', () => {
    it('handles error without stack trace', () => {
      const error = new Error('No stack');
      error.stack = undefined;

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(loggerModule.logger.error).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalled();
    });

    it('handles error with empty message', () => {
      const error = new Error('');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: '',
          }),
        })
      );
    });

    it('handles very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new Error(longMessage);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const responseBody = jsonSpy.mock.calls[0][0];
      expect(responseBody.error.message).toBe(longMessage);
    });
  });
});
