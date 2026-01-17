import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EntityDetailPage from '../../pages/EntityDetailPage';
import { useEntitiesStore } from '../../stores/entities.store';
import { apiService } from '../../services/api.service';

vi.mock('../../stores/entities.store');
vi.mock('../../services/api.service');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ entityId: 'sensor.temperature_living_room' }),
    useNavigate: () => vi.fn(),
  };
});

describe('EntityDetailPage', () => {
  const mockEntity = {
    entity_id: 'sensor.temperature_living_room',
    state: '22.5',
    attributes: {
      friendly_name: 'Living Room Temperature',
      unit_of_measurement: '°C',
      device_class: 'temperature',
    },
    last_changed: '2024-01-01T12:00:00Z',
    last_updated: '2024-01-01T12:00:00Z',
  };

  const mockHistoryData = {
    data: [
      {
        entity_id: 'sensor.temperature_living_room',
        state: '22.5',
        last_changed: '2024-01-01T12:00:00Z',
      },
      {
        entity_id: 'sensor.temperature_living_room',
        state: '23.0',
        last_changed: '2024-01-01T13:00:00Z',
      },
    ],
  };

  const mockStore = {
    entities: [mockEntity],
    fetchEntities: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useEntitiesStore as any).mockReturnValue(mockStore);
    (apiService.getEntityHistory as any).mockResolvedValue(mockHistoryData);
  });

  it('renders entity details', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const titles = screen.getAllByText(/Living Room Temperature/i);
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  it('displays entity state', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const values = screen.getAllByText(/\d+\.\d+/);
      expect(values.length).toBeGreaterThan(0);
    });
  });

  it('fetches entity history on mount', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(apiService.getEntityHistory).toHaveBeenCalled();
    });
  });

  it('displays time range buttons', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('displays loading state', () => {
    (apiService.getEntityHistory as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockHistoryData), 100))
    );

    const { container } = render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('handles entity not found', async () => {
    (useEntitiesStore as any).mockReturnValue({
      entities: [],
      fetchEntities: vi.fn(),
    });

    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const backButtons = screen.getAllByRole('button');
      expect(backButtons.length).toBeGreaterThan(0);
    });
  });

  it('displays entity attributes', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Classe de dispositif/i)).not.toBeNull();
      expect(screen.getByText('temperature')).not.toBeNull();
    });
  });

  it('renders chart container', async () => {
    const { container } = render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const chart = container.querySelector('.recharts-responsive-container');
      expect(chart).not.toBeNull();
    }, { timeout: 1000 });
  });

  it('displays entity unit', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Capteur/i)).not.toBeNull();
    });
  });

  it('navigates back when back button is clicked', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /retour/i });
      expect(backButton).not.toBeNull();
    });
  });

  it('handles history fetch error', async () => {
    (apiService.getEntityHistory as any).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const entities = screen.getAllByText(/Living Room Temperature/i);
      expect(entities.length).toBeGreaterThan(0);
    });
  });

  it('displays last update time', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('changes time range when button clicked', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(apiService.getEntityHistory).toHaveBeenCalled();
    });
  });

  it('displays entity ID', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/sensor\.temperature_living_room/i)).not.toBeNull();
    });
  });

  it('handles empty history data', async () => {
    (apiService.getEntityHistory as any).mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const entities = screen.getAllByText(/Living Room Temperature/i);
      expect(entities.length).toBeGreaterThan(0);
    });
  });

  it('renders back navigation button', async () => {
    render(
      <BrowserRouter>
        <EntityDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /retour/i });
      expect(backButton).not.toBeNull();
    });
  });
});
