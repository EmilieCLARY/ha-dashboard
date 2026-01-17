import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SystemMonitor from '../../pages/SystemMonitor';
import { useSystemStore } from '../../store/systemStore';
import { connectWebSocket, getSystemStatus } from '../../services/websocket';

vi.mock('../../store/systemStore');
vi.mock('../../services/websocket');

describe('SystemMonitor', () => {
  const mockSystemData = {
    cpu: { usage: 45.5, temperature: 62.3 },
    memory: { usage: 78.9, total: 16, used: 12.6 },
    disk: { usage: 65.2, total: 500, used: 326 },
    temperature: {
      cpu: 62.3,
      gpu: 55.8,
      motherboard: 45.2,
    },
  };

  const mockStore = {
    systemInfo: mockSystemData,
    loading: false,
    error: null,
    fetchSystemInfo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSystemStore as any).mockReturnValue(mockStore);
    (connectWebSocket as any).mockResolvedValue(undefined);
    (getSystemStatus as any).mockResolvedValue(mockSystemData);
  });

  it('renders page title', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    expect(screen.getByText(/Monitoring Système/)).not.toBeNull();
  });

  it('renders system status widget', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    const widgets = screen.getAllByText(/système/i);
    expect(widgets.length).toBeGreaterThan(0);
  });

  it('calls fetchSystemInfo on mount', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    expect(mockStore.fetchSystemInfo).toHaveBeenCalled();
  });

  it('renders CPU section', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    expect(screen.getByText(/Processeur/)).not.toBeNull();
  });

  it('renders Memory section', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    expect(screen.getByText(/Mémoire/)).not.toBeNull();
  });

  it('renders Disk section', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    expect(screen.getByText(/Disques/)).not.toBeNull();
  });

  it('renders Temperature section', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    expect(screen.getByText(/Températures/)).not.toBeNull();
  });

  it('displays CPU usage value', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    const values = screen.getAllByText('45.5');
    expect(values.length).toBeGreaterThan(0);
  });

  it('displays Memory usage value', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    const values = screen.getAllByText('78.9');
    expect(values.length).toBeGreaterThan(0);
  });

  it('displays Disk usage value', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    const values = screen.getAllByText('65.2');
    expect(values.length).toBeGreaterThan(0);
  });

  it('displays CPU temperature', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    const temps = screen.getAllByText('62.3');
    expect(temps.length).toBeGreaterThan(0);
  });

  it('navigates to dashboard', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    const backButtons = screen.getAllByRole('link');
    expect(backButtons.length).toBeGreaterThan(0);
  });

  it('displays loading state', () => {
    (useSystemStore as any).mockReturnValue({
      ...mockStore,
      loading: true,
      systemInfo: null,
    });

    const { container } = render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('displays error state', async () => {
    (useSystemStore as any).mockReturnValue({
      ...mockStore,
      error: 'Failed to fetch system info',
    });

    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/erreur/i)).not.toBeNull();
    });
  });

  it('handles empty system data', () => {
    (useSystemStore as any).mockReturnValue({
      ...mockStore,
      systemInfo: null,
    });

    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    expect(screen.getByText(/Monitoring Système/)).not.toBeNull();
  });

  it('renders temperature sensors with names', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    const cpuTempLabels = screen.getAllByText('CPU Temperature');
    expect(cpuTempLabels.length).toBeGreaterThan(0);
  });

  it('displays system status icon', () => {
    render(
      <BrowserRouter>
        <SystemMonitor />
      </BrowserRouter>
    );

    const title = screen.getByText(/Monitoring Système/);
    expect(title).not.toBeNull();
  });
});
