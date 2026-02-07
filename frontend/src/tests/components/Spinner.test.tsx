import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../../components/ui/Spinner';

describe('Spinner Component', () => {
  it('renders SVG element', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has animate-spin class', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('has blue color by default', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-blue-600');
  });

  it('applies small size', () => {
    const { container } = render(<Spinner size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-4');
    expect(svg).toHaveClass('w-4');
  });

  it('applies medium size by default', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-8');
    expect(svg).toHaveClass('w-8');
  });

  it('applies large size', () => {
    const { container } = render(<Spinner size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-12');
    expect(svg).toHaveClass('w-12');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });

  it('renders with proper SVG structure', () => {
    const { container } = render(<Spinner />);
    const circle = container.querySelector('circle');
    const path = container.querySelector('path');

    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();
    expect(circle).toHaveAttribute('cx', '12');
    expect(circle).toHaveAttribute('cy', '12');
    expect(circle).toHaveAttribute('r', '10');
  });

  it('has correct opacity classes on SVG elements', () => {
    const { container } = render(<Spinner />);
    const circle = container.querySelector('circle');
    const path = container.querySelector('path');

    expect(circle).toHaveClass('opacity-25');
    expect(path).toHaveClass('opacity-75');
  });

  it('renders all sizes correctly', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    const expectedClasses = [
      ['h-4', 'w-4'],
      ['h-8', 'w-8'],
      ['h-12', 'w-12'],
    ];

    sizes.forEach((size, index) => {
      const { container } = render(<Spinner size={size} />);
      const svg = container.querySelector('svg');
      expectedClasses[index].forEach((cls) => {
        expect(svg).toHaveClass(cls);
      });
    });
  });

  it('viewBox is set correctly', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('xmlns is set correctly', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });
});
