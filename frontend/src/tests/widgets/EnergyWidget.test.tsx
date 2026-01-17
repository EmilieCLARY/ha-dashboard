import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EnergyWidget } from '../../components/widgets/EnergyWidget';
import type { HomeAssistantEntity } from '../../services/api.service';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EnergyWidget', () => {
  const mockEntity: HomeAssistantEntity = {
    entity_id: 'sensor.power_consumption',
    state: '150',
    attributes: {
      device_class: 'power',
      unit_of_measurement: 'W',
      friendly_name: 'Power Consumption',
    },
    last_changed: '2026-01-17T10:00:00Z',
    last_updated: '2026-01-17T10:00:00Z',
    last_reported: '2026-01-17T10:00:00Z',
    context: { id: '1', parent_id: null, user_id: null },
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders power consumption in W', () => {
    render(
      <BrowserRouter>
        <EnergyWidget entity={mockEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/W/)).toBeInTheDocument();
  });

  it('converts to kW for high values', () => {
    const highPowerEntity = {
      ...mockEntity,
      state: '1500',
    };

    render(
      <BrowserRouter>
        <EnergyWidget entity={highPowerEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText(/1\.5/)).toBeInTheDocument();
    expect(screen.getByText(/kW/)).toBeInTheDocument();
  });

  it('shows consumption level - Faible (<100W)', () => {
    const lowPowerEntity = {
      ...mockEntity,
      state: '50',
    };

    render(
      <BrowserRouter>
        <EnergyWidget entity={lowPowerEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText(/faible/i)).toBeInTheDocument();
  });

  it('shows consumption level - Normale (100-500W)', () => {
    render(
      <BrowserRouter>
        <EnergyWidget entity={mockEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText(/normale/i)).toBeInTheDocument();
  });

  it('shows consumption level - Élevée (500-1000W)', () => {
    const mediumPowerEntity = {
      ...mockEntity,
      state: '750',
    };

    render(
      <BrowserRouter>
        <EnergyWidget entity={mediumPowerEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText(/élevée/i)).toBeInTheDocument();
  });

  it('shows consumption level - Très élevée (>1000W)', () => {
    const highPowerEntity = {
      ...mockEntity,
      state: '1500',
    };

    render(
      <BrowserRouter>
        <EnergyWidget entity={highPowerEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText(/très élevée/i)).toBeInTheDocument();
  });

  it('displays cost estimation', () => {
    render(
      <BrowserRouter>
        <EnergyWidget entity={mockEntity} />
      </BrowserRouter>
    );

    // 150W = 0.15kW * 0.15€/kWh = 0.0225€/h
    expect(screen.getByText(/0\.02/)).toBeInTheDocument();
    expect(screen.getByText(/€\/h/)).toBeInTheDocument();
  });

  it('shows progress bar', () => {
    const { container } = render(
      <BrowserRouter>
        <EnergyWidget entity={mockEntity} />
      </BrowserRouter>
    );

    const progressBar = container.querySelector('.h-2');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies green color for low consumption', () => {
    const lowPowerEntity = {
      ...mockEntity,
      state: '50',
    };

    const { container } = render(
      <BrowserRouter>
        <EnergyWidget entity={lowPowerEntity} />
      </BrowserRouter>
    );

    const widget = container.firstChild as HTMLElement;
    expect(widget.className).toMatch(/bg-green/);
  });

  it('applies yellow color for normal consumption', () => {
    const { container } = render(
      <BrowserRouter>
        <EnergyWidget entity={mockEntity} />
      </BrowserRouter>
    );

    const widget = container.firstChild as HTMLElement;
    expect(widget.className).toMatch(/bg-yellow/);
  });

  it('applies orange color for elevated consumption', () => {
    const mediumPowerEntity = {
      ...mockEntity,
      state: '750',
    };

    const { container } = render(
      <BrowserRouter>
        <EnergyWidget entity={mediumPowerEntity} />
      </BrowserRouter>
    );

    const widget = container.firstChild as HTMLElement;
    expect(widget.className).toMatch(/bg-orange/);
  });

  it('applies red color for very high consumption', () => {
    const highPowerEntity = {
      ...mockEntity,
      state: '1500',
    };

    const { container } = render(
      <BrowserRouter>
        <EnergyWidget entity={highPowerEntity} />
      </BrowserRouter>
    );

    const widget = container.firstChild as HTMLElement;
    expect(widget.className).toMatch(/bg-red/);
  });

  it('navigates to detail page when clicked', () => {
    render(
      <BrowserRouter>
        <EnergyWidget entity={mockEntity} />
      </BrowserRouter>
    );

    const widget = screen.getByText('Power Consumption').closest('div[class*="cursor-pointer"]');
    if (widget) {
      widget.click();
      expect(mockNavigate).toHaveBeenCalledWith('/entity/sensor.power_consumption');
    }
  });

  it('handles zero consumption', () => {
    const zeroEntity = {
      ...mockEntity,
      state: '0',
    };

    render(
      <BrowserRouter>
        <EnergyWidget entity={zeroEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/faible/i)).toBeInTheDocument();
  });

  it('handles unavailable state', () => {
    const unavailableEntity = {
      ...mockEntity,
      state: 'unavailable',
    };

    render(
      <BrowserRouter>
        <EnergyWidget entity={unavailableEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText('unavailable')).toBeInTheDocument();
  });

  it('shows trend icon', () => {
    const { container } = render(
      <BrowserRouter>
        <EnergyWidget entity={mockEntity} />
      </BrowserRouter>
    );

    // Should have a trend icon (TrendingUp or TrendingDown)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
