import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SystemStatusWidget } from '../../components/widgets/SystemStatusWidget';
import { useEntitiesStore } from '../../stores/entities.store';
import type { HomeAssistantEntity } from '../../types/homeAssistant';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../stores/entities.store', () => ({
  useEntitiesStore: vi.fn(),
}));

describe('SystemStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStoreHealthy = {
    entities: [],
    haConnected: true,
    wsConnected: true,
  };

  const mockStoreUnhealthy = {
    entities: [],
    haConnected: false,
    wsConnected: false,
  };

  it('displays operational status when system is healthy', () => {
    (useEntitiesStore as any).mockReturnValue(mockStoreHealthy);

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('Opérationnel')).toBeInTheDocument();
  });

  it('displays problem status when system is unhealthy', () => {
    (useEntitiesStore as any).mockReturnValue(mockStoreUnhealthy);

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('Problème détecté')).toBeInTheDocument();
  });

  it('applies green background when system is healthy', () => {
    (useEntitiesStore as any).mockReturnValue(mockStoreHealthy);

    const { container } = render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    const widget = container.querySelector('.from-green-50');
    expect(widget).toBeInTheDocument();
  });

  it('applies red background when system is unhealthy', () => {
    (useEntitiesStore as any).mockReturnValue(mockStoreUnhealthy);

    const { container } = render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    const widget = container.querySelector('.from-red-50');
    expect(widget).toBeInTheDocument();
  });

  it('displays entity count', () => {
    (useEntitiesStore as any).mockReturnValue({
      ...mockStoreHealthy,
      entities: [
        { entity_id: 'sensor.temp1' },
        { entity_id: 'sensor.temp2' },
        { entity_id: 'light.living_room' },
      ],
    });

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('3 entités chargées')).toBeInTheDocument();
  });

  it('displays API OK status when connected', () => {
    (useEntitiesStore as any).mockReturnValue(mockStoreHealthy);

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('API: OK')).toBeInTheDocument();
  });

  it('displays API KO status when disconnected', () => {
    (useEntitiesStore as any).mockReturnValue({
      ...mockStoreHealthy,
      haConnected: false,
    });

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('API: KO')).toBeInTheDocument();
  });

  it('displays WS OK status when connected', () => {
    (useEntitiesStore as any).mockReturnValue(mockStoreHealthy);

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('WS: OK')).toBeInTheDocument();
  });

  it('displays WS KO status when disconnected', () => {
    (useEntitiesStore as any).mockReturnValue({
      ...mockStoreHealthy,
      wsConnected: false,
    });

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('WS: KO')).toBeInTheDocument();
  });

  it('displays CPU usage when available', () => {
    const cpuEntity: HomeAssistantEntity = {
      entity_id: 'sensor.cpu_use',
      state: '45.5',
      attributes: {},
      last_changed: '2024-01-17T10:00:00.000Z',
      last_updated: '2024-01-17T10:00:00.000Z',
    };

    (useEntitiesStore as any).mockReturnValue({
      ...mockStoreHealthy,
      entities: [cpuEntity],
    });

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('45.5%')).toBeInTheDocument();
  });

  it('displays memory usage when available', () => {
    const memoryEntity: HomeAssistantEntity = {
      entity_id: 'sensor.memory_use',
      state: '62.3',
      attributes: {},
      last_changed: '2024-01-17T10:00:00.000Z',
      last_updated: '2024-01-17T10:00:00.000Z',
    };

    (useEntitiesStore as any).mockReturnValue({
      ...mockStoreHealthy,
      entities: [memoryEntity],
    });

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('Mémoire')).toBeInTheDocument();
    expect(screen.getByText('62.3%')).toBeInTheDocument();
  });

  it('displays disk usage when available', () => {
    const diskEntity: HomeAssistantEntity = {
      entity_id: 'sensor.disk_use',
      state: '78.9',
      attributes: {},
      last_changed: '2024-01-17T10:00:00.000Z',
      last_updated: '2024-01-17T10:00:00.000Z',
    };

    (useEntitiesStore as any).mockReturnValue({
      ...mockStoreHealthy,
      entities: [diskEntity],
    });

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('Disque')).toBeInTheDocument();
    expect(screen.getByText('78.9%')).toBeInTheDocument();
  });

  it('displays all system metrics when available', () => {
    const entities: HomeAssistantEntity[] = [
      {
        entity_id: 'sensor.cpu_use',
        state: '35.5',
        attributes: {},
        last_changed: '2024-01-17T10:00:00.000Z',
        last_updated: '2024-01-17T10:00:00.000Z',
      },
      {
        entity_id: 'sensor.memory_use',
        state: '55.2',
        attributes: {},
        last_changed: '2024-01-17T10:00:00.000Z',
        last_updated: '2024-01-17T10:00:00.000Z',
      },
      {
        entity_id: 'sensor.disk_use',
        state: '68.7',
        attributes: {},
        last_changed: '2024-01-17T10:00:00.000Z',
        last_updated: '2024-01-17T10:00:00.000Z',
      },
    ];

    (useEntitiesStore as any).mockReturnValue({
      ...mockStoreHealthy,
      entities,
    });

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('35.5%')).toBeInTheDocument();
    expect(screen.getByText('Mémoire')).toBeInTheDocument();
    expect(screen.getByText('55.2%')).toBeInTheDocument();
    expect(screen.getByText('Disque')).toBeInTheDocument();
    expect(screen.getByText('68.7%')).toBeInTheDocument();
  });

  it('navigates to entity detail when entity prop is provided', () => {
    const entity: HomeAssistantEntity = {
      entity_id: 'sensor.system_status',
      state: 'ok',
      attributes: {},
      last_changed: '2024-01-17T10:00:00.000Z',
      last_updated: '2024-01-17T10:00:00.000Z',
    };

    (useEntitiesStore as any).mockReturnValue(mockStoreHealthy);

    render(
      <BrowserRouter>
        <SystemStatusWidget entity={entity} />
      </BrowserRouter>
    );

    const widget = screen.getByText('Home Assistant').closest('div');
    widget?.click();

    expect(mockNavigate).toHaveBeenCalledWith('/entity/sensor.system_status');
  });

  it('does not navigate when no entity prop is provided', () => {
    (useEntitiesStore as any).mockReturnValue(mockStoreHealthy);

    render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    const widget = screen.getByText('Home Assistant').closest('div');
    widget?.click();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays last update time when entity is provided', () => {
    const entity: HomeAssistantEntity = {
      entity_id: 'sensor.system_status',
      state: 'ok',
      attributes: {},
      last_changed: '2024-01-17T10:00:00.000Z',
      last_updated: '2024-01-17T10:00:00.000Z',
    };

    (useEntitiesStore as any).mockReturnValue(mockStoreHealthy);

    render(
      <BrowserRouter>
        <SystemStatusWidget entity={entity} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Dernière mise à jour:/)).toBeInTheDocument();
  });

  it('renders progress bars for system metrics', () => {
    const cpuEntity: HomeAssistantEntity = {
      entity_id: 'sensor.cpu_use',
      state: '45',
      attributes: {},
      last_changed: '2024-01-17T10:00:00.000Z',
      last_updated: '2024-01-17T10:00:00.000Z',
    };

    (useEntitiesStore as any).mockReturnValue({
      ...mockStoreHealthy,
      entities: [cpuEntity],
    });

    const { container } = render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    const progressBar = container.querySelector('[style*="width: 45%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies green color for low usage (<50%)', () => {
    const cpuEntity: HomeAssistantEntity = {
      entity_id: 'sensor.cpu_use',
      state: '35',
      attributes: {},
      last_changed: '2024-01-17T10:00:00.000Z',
      last_updated: '2024-01-17T10:00:00.000Z',
    };

    (useEntitiesStore as any).mockReturnValue({
      ...mockStoreHealthy,
      entities: [cpuEntity],
    });

    const { container } = render(
      <BrowserRouter>
        <SystemStatusWidget />
      </BrowserRouter>
    );

    const progressBar = container.querySelector('.bg-green-500');
    expect(progressBar).toBeInTheDocument();
  });
});
