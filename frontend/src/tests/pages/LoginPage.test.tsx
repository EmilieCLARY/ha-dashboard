import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../pages/LoginPage';
import { useAuthStore } from '../../stores/auth.store';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../stores/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAuthStore = {
    login: vi.fn(),
    register: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  };

  it('renders login mode by default', () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your dashboard')).toBeInTheDocument();
  });

  it('displays email and password fields', () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('displays Sign In button in login mode', () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to register mode when clicking toggle', async () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const toggleButton = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      const buttons = screen.getAllByText('Create Account');
      expect(buttons.length).toBeGreaterThan(0);
    }, { timeout: 1000 });
  });

  it('shows name field in register mode', async () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Switch to register mode
    const toggleButton = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    });
  });

  it('displays error message when error exists', () => {
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      error: 'Invalid credentials',
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('calls login with email and password on submit', async () => {
    const loginMock = vi.fn().mockResolvedValue({});
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      login: loginMock,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('calls register with name, email and password on submit in register mode', async () => {
    const registerMock = vi.fn().mockResolvedValue({});
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      register: registerMock,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Switch to register mode
    const toggleButton = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe');
    });
  });

  it('navigates to home after successful login', async () => {
    const loginMock = vi.fn().mockResolvedValue({});
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      login: loginMock,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays loading state during login', () => {
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      isLoading: true,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Signing In...')).toBeInTheDocument();
  });

  it('displays loading state during registration', async () => {
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      isLoading: true,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Switch to register mode first
    const toggleButton = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(toggleButton);

    // Wait briefly for state update
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('disables submit button when loading', () => {
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      isLoading: true,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /signing in/i });
    expect(submitButton).toBeDisabled();
  });

  it('clears error when switching between modes', async () => {
    const clearErrorMock = vi.fn();
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      error: 'Some error',
      clearError: clearErrorMock,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const toggleButton = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(clearErrorMock).toHaveBeenCalled();
    });
  });

  it('clears error on form submit', async () => {
    const clearErrorMock = vi.fn();
    const loginMock = vi.fn().mockResolvedValue({});
    (useAuthStore as any).mockReturnValue({
      ...mockAuthStore,
      login: loginMock,
      clearError: clearErrorMock,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(clearErrorMock).toHaveBeenCalled();
    });
  });

  it('displays password minimum length hint in register mode', async () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Switch to register mode
    const toggleButton = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('displays footer with version', () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Home Assistant Dashboard v1.0')).toBeInTheDocument();
  });

  it('displays login icon', () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    const { container } = render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Check for lucide icon
    const icon = container.querySelector('svg.lucide-log-in');
    expect(icon).toBeInTheDocument();
  });

  it('requires email field', () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    expect(emailInput.required).toBe(true);
  });

  it('requires password field', () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    expect(passwordInput.required).toBe(true);
  });

  it('password field has minimum length of 8', () => {
    (useAuthStore as any).mockReturnValue(mockAuthStore);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    expect(passwordInput.minLength).toBe(8);
  });
});
