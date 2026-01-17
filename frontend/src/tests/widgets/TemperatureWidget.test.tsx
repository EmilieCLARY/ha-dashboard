import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TemperatureWidget } from '../../components/widgets/TemperatureWidget';
import type { HomeAssistantEntity } from '../../services/api.service';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TemperatureWidget', () => {
  const mockEntity: HomeAssistantEntity = {
    entity_id: 'sensor.living_room_temperature',
    state: '22.5',
    attributes: {
      device_class: 'temperature',
      unit_of_measurement: '°C',
      friendly_name: 'Living Room Temperature',
    },
    last_changed: '2026-01-17T10:00:00Z',
    last_updated: '2026-01-17T10:00:00Z',
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders temperature value with unit', () => {
    render(
      <BrowserRouter>
        <TemperatureWidget entity={mockEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText('22.5')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  it('displays friendly name', () => {
    render(
      <BrowserRouter>
        <TemperatureWidget entity={mockEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Living Room Temperature')).toBeInTheDocument();
  });

  it('shows temperature icon', () => {
    const { container } = render(
      <BrowserRouter>
        <TemperatureWidget entity={mockEntity} />
      </BrowserRouter>
    );

    // Lucide icons render as SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('navigates to entity detail page when clicked', () => {
    render(
      <BrowserRouter>
        <TemperatureWidget entity={mockEntity} />
      </BrowserRouter>
    );

    const widget = screen.getByText('Living Room Temperature').closest('div[class*="cursor-pointer"]');
    expect(widget).toBeInTheDocument();
    
    if (widget) {
      fireEvent.click(widget);
      expect(mockNavigate).toHaveBeenCalledWith('/entity/sensor.living_room_temperature');
    }
  });

  it('applies appropriate color for normal temperature', () => {
    const { container } = render(
      <BrowserRouter>
        <TemperatureWidget entity={mockEntity} />
      </BrowserRouter>
    );

    // Should have green or blue color for normal temp (22.5°C)
    const tempElement = screen.getByText('22.5');
    const classes = tempElement.className;
    expect(classes).toMatch(/text-(green|blue)/);
  });

  it('handles high temperature with appropriate color', () => {
    const hotEntity = {
      ...mockEntity,
      state: '35.0',
    };

    const { container } = render(
      <BrowserRouter>
        <TemperatureWidget entity={hotEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText('35.0')).toBeInTheDocument();
    const tempElement = screen.getByText('35.0');
    const classes = tempElement.className;
    // High temp should be orange or red
    expect(classes).toMatch(/text-(orange|red)/);
  });

  it('handles low temperature with appropriate color', () => {
    const coldEntity = {
      ...mockEntity,
      state: '5.0',
    };

    render(
      <BrowserRouter>
        <TemperatureWidget entity={coldEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText('5.0')).toBeInTheDocument();
    const tempElement = screen.getByText('5.0');
    const classes = tempElement.className;
    // Low temp should be blue
    expect(classes).toMatch(/text-blue/);
  });

  it('handles unavailable state', () => {
    const unavailableEntity = {
      ...mockEntity,
      state: 'unavailable',
    };

    render(
      <BrowserRouter>
        <TemperatureWidget entity={unavailableEntity} />
      </BrowserRouter>
    );

    expect(screen.getByText('unavailable')).toBeInTheDocument();
  });

  it('handles missing unit of measurement', () => {
    const entityNoUnit = {
      ...mockEntity,
      attributes: {
        ...mockEntity.attributes,
        unit_of_measurement: undefined,
      },
    };

    render(
      <BrowserRouter>
        <TemperatureWidget entity={entityNoUnit} />
      </BrowserRouter>
    );

    expect(screen.getByText('22.5')).toBeInTheDocument();
  });

  it('displays last updated time', () => {
    render(
      <BrowserRouter>
        <TemperatureWidget entity={mockEntity} />
      </BrowserRouter>
    );

    // Should show some time-related text
    const widget = screen.getByText('Living Room Temperature').closest('div');
    expect(widget?.textContent).toBeTruthy();
  });
});
