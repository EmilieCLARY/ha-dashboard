import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../../components/ui/Card';

describe('Card Component', () => {
  it('renders children content', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with title only', () => {
    render(<Card title="Test Title">Content</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with title and subtitle', () => {
    render(
      <Card title="Title" subtitle="Subtitle">
        Content
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    render(
      <Card footer={<div>Footer Content</div>}>
        Main Content
      </Card>
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('applies padding styles', () => {
    const { rerender } = render(
      <Card padding="sm" data-testid="card">
        Content
      </Card>
    );
    let card = screen.getByTestId('card');
    expect(card).toHaveClass('p-3');

    rerender(
      <Card padding="md" data-testid="card">
        Content
      </Card>
    );
    card = screen.getByTestId('card');
    expect(card).toHaveClass('p-4');

    rerender(
      <Card padding="lg" data-testid="card">
        Content
      </Card>
    );
    card = screen.getByTestId('card');
    expect(card).toHaveClass('p-6');
  });

  it('applies hover effect when enabled', () => {
    render(
      <Card hover data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('hover:shadow-lg');
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-class" data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('renders with all props combined', () => {
    render(
      <Card
        title="Card Title"
        subtitle="Card Subtitle"
        padding="lg"
        hover
        footer={<div>Footer</div>}
        data-testid="card"
      >
        Card Content
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('has correct base styling classes', () => {
    render(
      <Card data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('shadow-md');
  });
});
