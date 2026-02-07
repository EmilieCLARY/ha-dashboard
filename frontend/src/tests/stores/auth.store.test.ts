import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from '../../stores/auth.store';
import * as authService from '../../services/auth.service';

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(() => false),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('has initial state correctly set', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Login', () => {
    it('sets loading state during login', async () => {
      const mockLogin = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      vi.mocked(authService.authService.login).mockImplementation(mockLogin);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const loginPromise = result.current.login('test@example.com', 'password');
        expect(result.current.isLoading).toBe(true);
        await loginPromise;
      });
    });

    it('successfully logs in user', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      vi.mocked(authService.authService.login).mockResolvedValue({
        user: mockUser,
        token: 'test-token',
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles login error', async () => {
      const error = new Error('Invalid credentials');
      (error as any).response = { data: { message: 'Invalid email or password' } };
      vi.mocked(authService.authService.login).mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong-password');
        } catch {
          // Expected error
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Invalid email or password');
    });

    it('clears error on new login attempt', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      vi.mocked(authService.authService.login).mockResolvedValue({
        user: mockUser,
        token: 'test-token',
      });

      const { result } = renderHook(() => useAuthStore());

      // Set an error first
      act(() => {
        useAuthStore.setState({ error: 'Previous error' });
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Register', () => {
    it('successfully registers user', async () => {
      const mockUser = { id: '1', email: 'newuser@example.com', name: 'New User' };
      vi.mocked(authService.authService.register).mockResolvedValue({
        user: mockUser,
        token: 'test-token',
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register('newuser@example.com', 'password', 'New User');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('handles registration error', async () => {
      const error = new Error('Registration failed');
      (error as any).response = { data: { message: 'Email already exists' } };
      vi.mocked(authService.authService.register).mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.register('existing@example.com', 'password', 'User');
        } catch {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Email already exists');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Logout', () => {
    it('successfully logs out user', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      vi.mocked(authService.authService.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      // Set user as logged in
      act(() => {
        useAuthStore.setState({
          user: mockUser,
          isAuthenticated: true,
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Load User', () => {
    it('successfully loads current user', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      vi.mocked(authService.authService.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loadUser();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('handles load user error', async () => {
      const error = new Error('Failed to load user');
      vi.mocked(authService.authService.getCurrentUser).mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.loadUser();
        } catch {
          // Expected error
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Clear Error', () => {
    it('clears error message', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({ error: 'Test error' });
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('sets loading to false after successful operations', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      vi.mocked(authService.authService.login).mockResolvedValue({
        user: mockUser,
        token: 'test-token',
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('sets loading to false after failed operations', async () => {
      const error = new Error('Login failed');
      (error as any).response = { data: { message: 'Invalid credentials' } };
      vi.mocked(authService.authService.login).mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong-password');
        } catch {
          // Expected error
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
