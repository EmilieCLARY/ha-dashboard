import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HumidityWidget } from '../../components/widgets/HumidityWidget';
import type { HomeAssistantEntity } from '../../types/homeAssistant';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HumidityWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEntity = (humidity: string): HomeAssistantEntity => ({
    entity_id: 'sensor.humidity_test',
    state: humidity,
    attributes: {
      friendly_name: 'Test Humidity Sensor',
      unit_of_measurement: '%',
    },
    last_changed: '2024-01-17T10:00:00.000Z',
    last_updated: '2024-01-17T10:00:00.000Z',
  });

  it('renders humidity value with unit', () => {
    const entity = createEntity('45.5');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('45.5')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('displays friendly name', () => {
    const entity = createEntity('50');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Humidity Sensor')).toBeInTheDocument();
  });

  it('shows optimal status and icon for humidity between 30-60%', () => {
    const entity = createEntity('45');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Optimal')).toBeInTheDocument();
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('shows dry status and color for humidity below 30%', () => {
    const entity = createEntity('25');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Trop sec')).toBeInTheDocument();
    expect(screen.getByText('🏜️')).toBeInTheDocument();
    expect(screen.getByText('25.0')).toHaveClass('text-orange-500');
  });

  it('shows humid status and color for humidity above 60%', () => {
    const entity = createEntity('75');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Trop humide')).toBeInTheDocument();
    expect(screen.getByText('💧')).toBeInTheDocument();
    expect(screen.getByText('75.0')).toHaveClass('text-blue-600');
  });

  it('applies green color for optimal humidity (30%)', () => {
    const entity = createEntity('30');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('30.0')).toHaveClass('text-green-500');
  });

  it('applies green color for optimal humidity (60%)', () => {
    const entity = createEntity('60');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('60.0')).toHaveClass('text-green-500');
  });

  it('navigates to entity detail page on click', () => {
    const entity = createEntity('50');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = screen.getByText('Test Humidity Sensor').closest('div');
    widget?.click();

    expect(mockNavigate).toHaveBeenCalledWith('/entity/sensor.humidity_test');
  });

  it('displays last update time', () => {
    const entity = createEntity('45');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    // Vérifie que l'heure est affichée (format HH:MM)
    const timeElement = screen.getByText(/\d{2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  it('formats humidity with one decimal place', () => {
    const entity = createEntity('45.678');
    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('45.7')).toBeInTheDocument();
  });

  it('uses entity_id as fallback when friendly_name is missing', () => {
    const entity: HomeAssistantEntity = {
      entity_id: 'sensor.humidity_fallback',
      state: '50',
      attributes: {
        unit_of_measurement: '%',
      },
      last_changed: '2024-01-17T10:00:00.000Z',
      last_updated: '2024-01-17T10:00:00.000Z',
    };

    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('sensor.humidity_fallback')).toBeInTheDocument();
  });

  it('uses default unit when unit_of_measurement is missing', () => {
    const entity: HomeAssistantEntity = {
      entity_id: 'sensor.humidity_no_unit',
      state: '50',
      attributes: {
        friendly_name: 'No Unit Sensor',
      },
      last_changed: '2024-01-17T10:00:00.000Z',
      last_updated: '2024-01-17T10:00:00.000Z',
    };

    render(
      <BrowserRouter>
        <HumidityWidget entity={entity} />
      </BrowserRouter>
    );

    // Should still display % as default
    expect(screen.getByText('%')).toBeInTheDocument();
  });
});
