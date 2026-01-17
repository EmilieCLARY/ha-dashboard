import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WeatherWidget } from '../../components/widgets/WeatherWidget';
import type { HomeAssistantEntity } from '../../types/homeAssistant';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('WeatherWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEntity = (condition: string, attributes: any = {}): HomeAssistantEntity => ({
    entity_id: 'weather.home',
    state: condition,
    attributes: {
      friendly_name: 'Home Weather',
      temperature: 22,
      humidity: 65,
      wind_speed: 15,
      pressure: 1013,
      ...attributes,
    },
    last_changed: '2024-01-17T10:00:00.000Z',
    last_updated: '2024-01-17T10:00:00.000Z',
  });

  it('displays friendly name', () => {
    const entity = createEntity('sunny');
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Home Weather')).toBeInTheDocument();
  });

  it('displays temperature with rounded value and °C', () => {
    const entity = createEntity('sunny', { temperature: 22.7 });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  it('displays translated sunny condition', () => {
    const entity = createEntity('sunny');
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Ensoleillé')).toBeInTheDocument();
  });

  it('displays translated cloudy condition', () => {
    const entity = createEntity('cloudy');
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Nuageux')).toBeInTheDocument();
  });

  it('displays translated rainy condition', () => {
    const entity = createEntity('rainy');
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Pluvieux')).toBeInTheDocument();
  });

  it('displays translated snowy condition', () => {
    const entity = createEntity('snowy');
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Neigeux')).toBeInTheDocument();
  });

  it('displays humidity with percentage', () => {
    const entity = createEntity('sunny', { humidity: 65 });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('displays wind speed with unit', () => {
    const entity = createEntity('sunny', { wind_speed: 15, wind_speed_unit: 'km/h' });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('15 km/h')).toBeInTheDocument();
  });

  it('uses default wind speed unit when not provided', () => {
    const entity = createEntity('sunny', { wind_speed: 15 });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('15 km/h')).toBeInTheDocument();
  });

  it('displays pressure with unit', () => {
    const entity = createEntity('sunny', { pressure: 1013, pressure_unit: 'hPa' });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('1013 hPa')).toBeInTheDocument();
  });

  it('uses default pressure unit when not provided', () => {
    const entity = createEntity('sunny', { pressure: 1013 });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('1013 hPa')).toBeInTheDocument();
  });

  it('applies sunny/yellow gradient background for sunny condition', () => {
    const entity = createEntity('sunny');
    const { container } = render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = container.querySelector('.from-yellow-50');
    expect(widget).toBeInTheDocument();
  });

  it('applies blue gradient background for rainy condition', () => {
    const entity = createEntity('rainy');
    const { container } = render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = container.querySelector('.from-blue-50');
    expect(widget).toBeInTheDocument();
  });

  it('applies gray gradient background for cloudy condition', () => {
    const entity = createEntity('cloudy');
    const { container } = render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = container.querySelector('.from-gray-50');
    expect(widget).toBeInTheDocument();
  });

  it('displays weather icon', () => {
    const entity = createEntity('sunny');
    const { container } = render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    // Check that an icon (svg) is rendered
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('navigates to entity detail page on click', () => {
    const entity = createEntity('sunny');
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = screen.getByText('Home Weather').closest('div');
    widget?.click();

    expect(mockNavigate).toHaveBeenCalledWith('/entity/weather.home');
  });

  it('displays forecast when available', () => {
    const entity = createEntity('sunny', {
      forecast: [
        { datetime: '2024-01-18T12:00:00Z', temperature: 20 },
        { datetime: '2024-01-19T12:00:00Z', temperature: 18 },
        { datetime: '2024-01-20T12:00:00Z', temperature: 22 },
      ],
    });

    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('20°')).toBeInTheDocument();
    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText('22°')).toBeInTheDocument();
  });

  it('limits forecast display to 3 days', () => {
    const entity = createEntity('sunny', {
      forecast: [
        { datetime: '2024-01-18T12:00:00Z', temperature: 20 },
        { datetime: '2024-01-19T12:00:00Z', temperature: 18 },
        { datetime: '2024-01-20T12:00:00Z', temperature: 22 },
        { datetime: '2024-01-21T12:00:00Z', temperature: 25 },
        { datetime: '2024-01-22T12:00:00Z', temperature: 23 },
      ],
    });

    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('20°')).toBeInTheDocument();
    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText('22°')).toBeInTheDocument();
    expect(screen.queryByText('25°')).not.toBeInTheDocument();
  });

  it('does not crash when temperature is undefined', () => {
    const entity = createEntity('sunny', { temperature: undefined });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Home Weather')).toBeInTheDocument();
    expect(screen.getByText('Ensoleillé')).toBeInTheDocument();
  });

  it('does not crash when humidity is undefined', () => {
    const entity = createEntity('sunny', { humidity: undefined });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Home Weather')).toBeInTheDocument();
  });

  it('does not crash when wind_speed is undefined', () => {
    const entity = createEntity('sunny', { wind_speed: undefined });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Home Weather')).toBeInTheDocument();
  });

  it('does not crash when forecast is undefined', () => {
    const entity = createEntity('sunny', { forecast: undefined });
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Home Weather')).toBeInTheDocument();
  });

  it('capitalizes unknown condition', () => {
    const entity = createEntity('unknown_condition');
    render(
      <BrowserRouter>
        <WeatherWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Unknown_condition')).toBeInTheDocument();
  });
});
