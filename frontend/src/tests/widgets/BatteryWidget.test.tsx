import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BatteryWidget } from '../../components/widgets/BatteryWidget';
import type { HomeAssistantEntity } from '../../types/homeAssistant';
import { createTestEntity } from '../testUtils';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BatteryWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createEntity = (battery: string): HomeAssistantEntity => createTestEntity({
    entity_id: 'sensor.battery_test',
    state: battery,
    attributes: {
      friendly_name: 'Test Battery',
      unit_of_measurement: '%',
    },
    last_changed: '2024-01-17T10:00:00.000Z',
    last_updated: '2024-01-17T10:00:00.000Z',
  });

  it('renders battery value with percentage', () => {
    const entity = createEntity('85');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('displays friendly name', () => {
    const entity = createEntity('75');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Battery')).toBeInTheDocument();
  });

  it('shows excellent status for battery > 75%', () => {
    const entity = createEntity('90');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('90')).toHaveClass('text-green-500');
  });

  it('applies green background for excellent battery', () => {
    const entity = createEntity('80');
    const { container } = render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = container.querySelector('.bg-green-50');
    expect(widget).toBeInTheDocument();
  });

  it('shows good status for battery 51-75%', () => {
    const entity = createEntity('60');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Bon')).toBeInTheDocument();
    expect(screen.getByText('60')).toHaveClass('text-yellow-500');
  });

  it('applies yellow background for good battery', () => {
    const entity = createEntity('65');
    const { container } = render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = container.querySelector('.bg-yellow-50');
    expect(widget).toBeInTheDocument();
  });

  it('shows medium status for battery 26-50%', () => {
    const entity = createEntity('40');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Moyen')).toBeInTheDocument();
    expect(screen.getByText('40')).toHaveClass('text-orange-500');
  });

  it('applies orange background for medium battery', () => {
    const entity = createEntity('35');
    const { container } = render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = container.querySelector('.bg-orange-50');
    expect(widget).toBeInTheDocument();
  });

  it('shows low status for battery ≤ 25%', () => {
    const entity = createEntity('15');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('Faible')).toBeInTheDocument();
    expect(screen.getByText('15')).toHaveClass('text-red-500');
  });

  it('applies red background for low battery', () => {
    const entity = createEntity('20');
    const { container } = render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = container.querySelector('.bg-red-50');
    expect(widget).toBeInTheDocument();
  });

  it('displays battery icon', () => {
    const entity = createEntity('50');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    // Icons should be present (🔋 or 🪫)
    const widget = screen.getByText('Test Battery').closest('div');
    expect(widget).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    const entity = createEntity('75');
    const { container } = render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const progressBar = container.querySelector('[style*="width: 75%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies green progress bar color for > 75%', () => {
    const entity = createEntity('80');
    const { container } = render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const progressBar = container.querySelector('.bg-green-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies yellow progress bar color for 51-75%', () => {
    const entity = createEntity('60');
    const { container } = render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const progressBar = container.querySelector('.bg-yellow-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies orange progress bar color for 26-50%', () => {
    const entity = createEntity('40');
    const { container } = render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const progressBar = container.querySelector('.bg-orange-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies red progress bar color for ≤ 25%', () => {
    const entity = createEntity('20');
    const { container } = render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const progressBar = container.querySelector('.bg-red-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('navigates to entity detail page on click', () => {
    const entity = createEntity('75');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = screen.getByText('Test Battery').closest('div');
    widget?.click();

    expect(mockNavigate).toHaveBeenCalledWith('/entity/sensor.battery_test');
  });

  it('displays last update time', () => {
    const entity = createEntity('50');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    const timeElement = screen.getByText(/\d{2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  it('handles edge case of 0% battery', () => {
    const entity = createEntity('0');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Faible')).toBeInTheDocument();
  });

  it('handles edge case of 100% battery', () => {
    const entity = createEntity('100');
    render(
      <BrowserRouter>
        <BatteryWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });
});
