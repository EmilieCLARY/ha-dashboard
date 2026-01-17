import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';
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

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEntities: HomeAssistantEntity[] = [
    {
      entity_id: 'sensor.temperature_living_room',
      state: '22.5',
      attributes: {
        friendly_name: 'Living Room Temperature',
        unit_of_measurement: '°C',
        device_class: 'temperature',
      },
      last_changed: '2024-01-18T10:00:00.000Z',
      last_updated: '2024-01-18T10:00:00.000Z',
      last_reported: '2024-01-18T10:00:00.000Z',
      context: { id: '1', parent_id: null, user_id: null },
    },
    {
      entity_id: 'sensor.humidity_living_room',
      state: '45',
      attributes: {
        friendly_name: 'Living Room Humidity',
        unit_of_measurement: '%',
        device_class: 'humidity',
      },
      last_changed: '2024-01-18T10:00:00.000Z',
      last_updated: '2024-01-18T10:00:00.000Z',
      last_reported: '2024-01-18T10:00:00.000Z',
      context: { id: '2', parent_id: null, user_id: null },
    },
    {
      entity_id: 'light.living_room',
      state: 'on',
      attributes: {
        friendly_name: 'Living Room Light',
        brightness: 200,
      },
      last_changed: '2024-01-18T10:00:00.000Z',
      last_updated: '2024-01-18T10:00:00.000Z',
      last_reported: '2024-01-18T10:00:00.000Z',
      context: { id: '3', parent_id: null, user_id: null },
    },
  ];

  const mockStore = {
    entities: mockEntities,
    loading: false,
    error: null,
    wsConnected: true,
    haConnected: true,
    fetchEntities: vi.fn(),
    connectWebSocket: vi.fn(),
  };

  it('renders dashboard title', () => {
    (useEntitiesStore as any).mockReturnValue(mockStore);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('🏠 Dashboard')).toBeInTheDocument();
  });

  it('displays entity count', () => {
    (useEntitiesStore as any).mockReturnValue(mockStore);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('3 entités disponibles')).toBeInTheDocument();
  });

  it('shows WS connected status', () => {
    (useEntitiesStore as any).mockReturnValue(mockStore);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('WS connecté')).toBeInTheDocument();
  });

  it('shows WS disconnected status', () => {
    (useEntitiesStore as any).mockReturnValue({
      ...mockStore,
      wsConnected: false,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('WS déconnecté')).toBeInTheDocument();
  });

  it('shows HA connected status', () => {
    (useEntitiesStore as any).mockReturnValue(mockStore);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('HA connecté')).toBeInTheDocument();
  });

  it('shows HA waiting status', () => {
    (useEntitiesStore as any).mockReturnValue({
      ...mockStore,
      haConnected: false,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('HA en attente')).toBeInTheDocument();
  });

  it('calls fetchEntities on mount', () => {
    const fetchEntitiesMock = vi.fn();
    (useEntitiesStore as any).mockReturnValue({
      ...mockStore,
      fetchEntities: fetchEntitiesMock,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(fetchEntitiesMock).toHaveBeenCalledTimes(1);
  });

  it('calls connectWebSocket on mount', () => {
    const connectWebSocketMock = vi.fn();
    (useEntitiesStore as any).mockReturnValue({
      ...mockStore,
      connectWebSocket: connectWebSocketMock,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(connectWebSocketMock).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    (useEntitiesStore as any).mockReturnValue({
      ...mockStore,
      entities: [],
      loading: true,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Chargement des entités...')).toBeInTheDocument();
  });

  it('displays loading spinner', () => {
    (useEntitiesStore as any).mockReturnValue({
      ...mockStore,
      entities: [],
      loading: true,
    });

    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useEntitiesStore as any).mockReturnValue({
      ...mockStore,
      error: 'Connection failed',
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('displays retry button on error', () => {
    const fetchEntitiesMock = vi.fn();
    (useEntitiesStore as any).mockReturnValue({
      ...mockStore,
      error: 'Connection failed',
      fetchEntities: fetchEntitiesMock,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const retryButton = screen.getByText('Réessayer');
    expect(retryButton).toBeInTheDocument();
    
    retryButton.click();
    expect(fetchEntitiesMock).toHaveBeenCalled();
  });

  it('renders temperature section when sensors exist', () => {
    (useEntitiesStore as any).mockReturnValue(mockStore);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('🌡️ Températures')).toBeInTheDocument();
  });

  it('renders humidity section when sensors exist', () => {
    (useEntitiesStore as any).mockReturnValue(mockStore);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('💧 Humidité')).toBeInTheDocument();
  });

  it('renders lights section when lights exist', () => {
    (useEntitiesStore as any).mockReturnValue(mockStore);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('💡 Lumières')).toBeInTheDocument();
  });

  it('does not show loading when entities already loaded', () => {
    (useEntitiesStore as any).mockReturnValue({
      ...mockStore,
      loading: true, // Loading but entities exist
      entities: mockEntities,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Should not show loading screen
    expect(screen.queryByText('Chargement des entités...')).not.toBeInTheDocument();
    // Should show dashboard
    expect(screen.getByText('🏠 Dashboard')).toBeInTheDocument();
  });

  it('renders widgets for each entity type', () => {
    (useEntitiesStore as any).mockReturnValue(mockStore);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Should render entity friendly names (using getAllByText for duplicates)
    const tempElements = screen.getAllByText('Living Room Temperature');
    expect(tempElements.length).toBeGreaterThan(0);
    const humidityElements = screen.getAllByText('Living Room Humidity');
    expect(humidityElements.length).toBeGreaterThan(0);
    const lightElements = screen.getAllByText('Living Room Light');
    expect(lightElements.length).toBeGreaterThan(0);
  });
});
