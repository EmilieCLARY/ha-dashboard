import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../components/ui/Input';

describe('Input Component', () => {
  beforeEach(() => {
    // Clear any test artifacts
  });

  it('renders input element', () => {
    render(<Input data-testid="test-input" />);
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('handles input value change', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="test-input" />);
    const input = screen.getByTestId('test-input') as HTMLInputElement;

    await user.type(input, 'test value');
    expect(input.value).toBe('test value');
  });

  it('displays error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(<Input helperText="Helper text here" />);
    expect(screen.getByText('Helper text here')).toBeInTheDocument();
  });

  it('applies error styling when error prop is present', () => {
    render(<Input error="Error message" data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('border-red-300');
  });

  it('has fullWidth class when prop is true', () => {
    render(<Input fullWidth data-testid="test-input" />);
    const container = screen.getByTestId('test-input').parentElement?.parentElement;
    expect(container).toHaveClass('w-full');
  });

  it('renders with left icon', () => {
    render(
      <Input
        leftIcon={<span data-testid="left-icon">🔍</span>}
        data-testid="test-input"
      />
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    render(
      <Input
        rightIcon={<span data-testid="right-icon">✓</span>}
        data-testid="test-input"
      />
    );
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('custom-class');
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="test-input" />);
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" data-testid="test-input" />);
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'password');
  });

  it('supports disabled state', () => {
    render(<Input disabled data-testid="test-input" />);
    expect(screen.getByTestId('test-input')).toBeDisabled();
  });

  it('renders with all props combined', () => {
    render(
      <Input
        label="Email"
        placeholder="Enter your email"
        type="email"
        fullWidth
        helperText="We'll never share your email"
        data-testid="test-input"
      />
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
  });

  it('is forwarded as ref correctly', () => {
    const ref = { current: null };
    render(<Input ref={ref} data-testid="test-input" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('applies padding classes for icons', () => {
    const { rerender } = render(
      <Input
        leftIcon={<span>🔍</span>}
        data-testid="test-input"
      />
    );
    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('pl-10');

    rerender(
      <Input
        rightIcon={<span>✓</span>}
        data-testid="test-input"
      />
    );
    expect(screen.getByTestId('test-input')).toHaveClass('pr-10');
  });
});
