import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LightWidget } from '../../components/widgets/LightWidget';
import { apiService } from '../../services/api.service';
import type { HomeAssistantEntity } from '../../services/api.service';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/api.service', () => ({
  apiService: {
    callService: vi.fn(),
  },
}));

describe('LightWidget', () => {
  const mockLightOn: HomeAssistantEntity = {
    entity_id: 'light.bedroom',
    state: 'on',
    attributes: {
      friendly_name: 'Bedroom Light',
      brightness: 200,
    },
    last_changed: '2026-01-17T10:00:00Z',
    last_updated: '2026-01-17T10:00:00Z',
    last_reported: '2026-01-17T10:00:00Z',
    context: { id: '1', parent_id: null, user_id: null },
  };

  const mockLightOff: HomeAssistantEntity = {
    ...mockLightOn,
    state: 'off',
    attributes: {
      friendly_name: 'Bedroom Light',
    },
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(apiService.callService).mockClear();
    vi.mocked(apiService.callService).mockResolvedValue({ data: {} } as any);
  });

  it('renders light name', () => {
    render(
      <BrowserRouter>
        <LightWidget entity={mockLightOn} />
      </BrowserRouter>
    );

    expect(screen.getByText('Bedroom Light')).toBeInTheDocument();
  });

  it('shows light is on', () => {
    render(
      <BrowserRouter>
        <LightWidget entity={mockLightOn} />
      </BrowserRouter>
    );

    expect(screen.getByText(/allumée/i)).toBeInTheDocument();
  });

  it('shows light is off', () => {
    render(
      <BrowserRouter>
        <LightWidget entity={mockLightOff} />
      </BrowserRouter>
    );

    expect(screen.getByText(/éteinte/i)).toBeInTheDocument();
  });

  it('displays brightness when light is on', () => {
    render(
      <BrowserRouter>
        <LightWidget entity={mockLightOn} />
      </BrowserRouter>
    );

    // Brightness 200/255 ≈ 78%
    const brightnessText = screen.getByText(/78%/i);
    expect(brightnessText).toBeInTheDocument();
  });

  it('shows progress bar for brightness', () => {
    const { container } = render(
      <BrowserRouter>
        <LightWidget entity={mockLightOn} />
      </BrowserRouter>
    );

    const progressBar = container.querySelector('.h-2');
    expect(progressBar).toBeInTheDocument();
  });

  it('has yellow background when light is on', () => {
    const { container } = render(
      <BrowserRouter>
        <LightWidget entity={mockLightOn} />
      </BrowserRouter>
    );

    const widget = container.firstChild as HTMLElement;
    expect(widget.className).toMatch(/bg-yellow/);
  });

  it('has gray background when light is off', () => {
    const { container } = render(
      <BrowserRouter>
        <LightWidget entity={mockLightOff} />
      </BrowserRouter>
    );

    const widget = container.firstChild as HTMLElement;
    expect(widget.className).toMatch(/bg-gray/);
  });

  it('calls turn_on service when clicking power button on off light', async () => {
    render(
      <BrowserRouter>
        <LightWidget entity={mockLightOff} />
      </BrowserRouter>
    );

    const powerButton = screen.getByRole('button');
    fireEvent.click(powerButton);

    await waitFor(() => {
      expect(apiService.callService).toHaveBeenCalledWith(
        'light',
        'turn_on',
        { entity_id: 'light.bedroom' }
      );
    });
  });

  it('calls turn_off service when clicking power button on on light', async () => {
    render(
      <BrowserRouter>
        <LightWidget entity={mockLightOn} />
      </BrowserRouter>
    );

    const powerButton = screen.getByRole('button');
    fireEvent.click(powerButton);

    await waitFor(() => {
      expect(apiService.callService).toHaveBeenCalledWith(
        'light',
        'turn_off',
        { entity_id: 'light.bedroom' }
      );
    });
  });

  it('shows loading state when toggling', async () => {
    vi.mocked(apiService.callService).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <BrowserRouter>
        <LightWidget entity={mockLightOff} />
      </BrowserRouter>
    );

    const powerButton = screen.getByRole('button');
    fireEvent.click(powerButton);

    // Button should be disabled during loading
    expect(powerButton).toBeDisabled();
  });

  it('navigates to detail page when clicking card (not button)', () => {
    render(
      <BrowserRouter>
        <LightWidget entity={mockLightOn} />
      </BrowserRouter>
    );

    const lightName = screen.getByText('Bedroom Light');
    fireEvent.click(lightName);

    expect(mockNavigate).toHaveBeenCalledWith('/entity/light.bedroom');
  });

  it('does not navigate when clicking power button', () => {
    render(
      <BrowserRouter>
        <LightWidget entity={mockLightOn} />
      </BrowserRouter>
    );

    const powerButton = screen.getByRole('button');
    fireEvent.click(powerButton);

    // Navigate should not be called (stopPropagation)
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles brightness of 0', () => {
    const lightWithZeroBrightness = {
      ...mockLightOn,
      attributes: {
        ...mockLightOn.attributes,
        brightness: 0,
      },
    };

    render(
      <BrowserRouter>
        <LightWidget entity={lightWithZeroBrightness} />
      </BrowserRouter>
    );

    expect(screen.getByText(/0%/i)).toBeInTheDocument();
  });

  it('handles brightness of 255 (max)', () => {
    const lightWithMaxBrightness = {
      ...mockLightOn,
      attributes: {
        ...mockLightOn.attributes,
        brightness: 255,
      },
    };

    render(
      <BrowserRouter>
        <LightWidget entity={lightWithMaxBrightness} />
      </BrowserRouter>
    );

    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  it('handles light without brightness attribute', () => {
    const lightNoBrightness = {
      ...mockLightOn,
      attributes: {
        friendly_name: 'Bedroom Light',
      },
    };

    render(
      <BrowserRouter>
        <LightWidget entity={lightNoBrightness} />
      </BrowserRouter>
    );

    // Should still render without errors
    expect(screen.getByText('Bedroom Light')).toBeInTheDocument();
  });
});
