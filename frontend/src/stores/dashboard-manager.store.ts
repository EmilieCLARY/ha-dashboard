import { create } from 'zustand';
import { apiService } from '../services/api.service';

export interface WidgetConfig {
  i: string; // Unique widget ID
  x: number; // X position in grid
  y: number; // Y position in grid
  w: number; // Width in grid units
  h: number; // Height in grid units
  minW?: number; // Minimum width
  minH?: number; // Minimum height
  maxW?: number; // Maximum width
  maxH?: number; // Maximum height
  static?: boolean; // Cannot be moved/resized
  widgetType: string; // Type of widget (temperature, humidity, etc.)
  entityId?: string; // Associated entity ID
  config?: Record<string, any>; // Widget-specific configuration
}

export interface DashboardConfig {
  layout: WidgetConfig[];
  cols?: number; // Number of columns (default: 12)
  rowHeight?: number; // Height of each row (default: 100)
  breakpoints?: Record<string, number>; // Responsive breakpoints
}

export interface Dashboard {
  id: string;
  userId: string;
  name: string;
  description?: string;
  config: DashboardConfig;
  isDefault: boolean;
  isTemplate: boolean;
  templateId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description?: string;
  config: DashboardConfig;
  preview?: string;
}

interface DashboardState {
  dashboards: Dashboard[];
  templates: DashboardTemplate[];
  activeDashboardId: string | null;
  isLoading: boolean;
  error: string | null;
  editMode: boolean;

  // Actions
  loadDashboards: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  setActiveDashboard: (id: string) => void;
  createDashboard: (data: {
    name: string;
    description?: string;
    config: DashboardConfig;
    isDefault?: boolean;
  }) => Promise<Dashboard>;
  updateDashboard: (id: string, data: Partial<Dashboard>) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  duplicateDashboard: (id: string) => Promise<Dashboard>;
  createFromTemplate: (templateId: string, name?: string) => Promise<Dashboard>;
  exportDashboard: (id: string) => Promise<any>;
  importDashboard: (data: any) => Promise<Dashboard>;
  updateLayout: (layout: WidgetConfig[]) => Promise<void>;
  addWidget: (widget: WidgetConfig) => Promise<void>;
  removeWidget: (widgetId: string) => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => Promise<void>;
  setEditMode: (enabled: boolean) => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboards: [],
  templates: [],
  activeDashboardId: null,
  isLoading: false,
  error: null,
  editMode: false,

  loadDashboards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.get('/dashboards');
      const dashboards = response.data.data;
      
      // Find default dashboard or first one
      const defaultDashboard = dashboards.find((d: Dashboard) => d.isDefault) || dashboards[0];
      
      set({
        dashboards,
        activeDashboardId: defaultDashboard?.id || null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to load dashboards',
        isLoading: false,
      });
    }
  },

  loadTemplates: async () => {
    try {
      const response = await apiService.get('/dashboards/templates');
      set({ templates: response.data.data });
    } catch (error: any) {
      console.error('Failed to load templates:', error);
    }
  },

  setActiveDashboard: (id: string) => {
    set({ activeDashboardId: id, editMode: false });
  },

  createDashboard: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.post('/dashboards', data);
      const newDashboard = response.data.data;
      
      set((state) => ({
        dashboards: [...state.dashboards, newDashboard],
        activeDashboardId: newDashboard.id,
        isLoading: false,
      }));
      
      return newDashboard;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create dashboard',
        isLoading: false,
      });
      throw error;
    }
  },

  updateDashboard: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.put(`/dashboards/${id}`, data);
      const updated = response.data.data;
      
      set((state) => ({
        dashboards: state.dashboards.map((d) => (d.id === id ? updated : d)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update dashboard',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteDashboard: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.delete(`/dashboards/${id}`);
      
      set((state) => {
        const dashboards = state.dashboards.filter((d) => d.id !== id);
        const activeDashboardId =
          state.activeDashboardId === id
            ? dashboards[0]?.id || null
            : state.activeDashboardId;
        
        return { dashboards, activeDashboardId, isLoading: false };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete dashboard',
        isLoading: false,
      });
      throw error;
    }
  },

  duplicateDashboard: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.post(`/dashboards/${id}/duplicate`);
      const duplicate = response.data.data;
      
      set((state) => ({
        dashboards: [...state.dashboards, duplicate],
        activeDashboardId: duplicate.id,
        isLoading: false,
      }));
      
      return duplicate;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to duplicate dashboard',
        isLoading: false,
      });
      throw error;
    }
  },

  createFromTemplate: async (templateId, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.post(`/dashboards/from-template/${templateId}`, {
        name,
      });
      const dashboard = response.data.data;
      
      set((state) => ({
        dashboards: [...state.dashboards, dashboard],
        activeDashboardId: dashboard.id,
        isLoading: false,
      }));
      
      return dashboard;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create from template',
        isLoading: false,
      });
      throw error;
    }
  },

  exportDashboard: async (id) => {
    try {
      const response = await apiService.get(`/dashboards/${id}/export`);
      return response.data.data;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to export dashboard' });
      throw error;
    }
  },

  importDashboard: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.post('/dashboards/import', data);
      const dashboard = response.data.data;
      
      set((state) => ({
        dashboards: [...state.dashboards, dashboard],
        activeDashboardId: dashboard.id,
        isLoading: false,
      }));
      
      return dashboard;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to import dashboard',
        isLoading: false,
      });
      throw error;
    }
  },

  updateLayout: async (layout) => {
    const { activeDashboardId, dashboards } = get();
    if (!activeDashboardId) return;

    const dashboard = dashboards.find((d) => d.id === activeDashboardId);
    if (!dashboard) return;

    const updatedConfig = {
      ...dashboard.config,
      layout,
    };

    try {
      await get().updateDashboard(activeDashboardId, { config: updatedConfig });
    } catch (error) {
      console.error('Failed to update layout:', error);
    }
  },

  addWidget: async (widget) => {
    const { activeDashboardId, dashboards } = get();
    if (!activeDashboardId) return;

    const dashboard = dashboards.find((d) => d.id === activeDashboardId);
    if (!dashboard) return;

    const updatedLayout = [...dashboard.config.layout, widget];
    await get().updateLayout(updatedLayout);
  },

  removeWidget: async (widgetId) => {
    const { activeDashboardId, dashboards } = get();
    if (!activeDashboardId) return;

    const dashboard = dashboards.find((d) => d.id === activeDashboardId);
    if (!dashboard) return;

    const updatedLayout = dashboard.config.layout.filter((w) => w.i !== widgetId);
    await get().updateLayout(updatedLayout);
  },

  updateWidget: async (widgetId, updates) => {
    const { activeDashboardId, dashboards } = get();
    if (!activeDashboardId) return;

    const dashboard = dashboards.find((d) => d.id === activeDashboardId);
    if (!dashboard) return;

    const updatedLayout = dashboard.config.layout.map((w) =>
      w.i === widgetId ? { ...w, ...updates } : w
    );
    await get().updateLayout(updatedLayout);
  },

  setEditMode: (enabled) => {
    set({ editMode: enabled });
  },

  clearError: () => {
    set({ error: null });
  },
}));
