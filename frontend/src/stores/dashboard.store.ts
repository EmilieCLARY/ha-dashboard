import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Widget {
  id: string;
  type: 'temperature' | 'humidity' | 'battery' | 'light' | 'energy' | 'custom';
  title: string;
  entityId: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  isDefault: boolean;
}

interface DashboardState {
  layouts: DashboardLayout[];
  currentLayoutId: string | null;
  isEditMode: boolean;
  
  // Actions
  addLayout: (layout: Omit<DashboardLayout, 'id'>) => void;
  removeLayout: (id: string) => void;
  updateLayout: (id: string, layout: Partial<DashboardLayout>) => void;
  setCurrentLayout: (id: string) => void;
  
  addWidget: (layoutId: string, widget: Omit<Widget, 'id'>) => void;
  removeWidget: (layoutId: string, widgetId: string) => void;
  updateWidget: (layoutId: string, widgetId: string, widget: Partial<Widget>) => void;
  updateWidgetPosition: (layoutId: string, widgetId: string, position: Widget['position']) => void;
  
  setEditMode: (isEditMode: boolean) => void;
  
  getCurrentLayout: () => DashboardLayout | undefined;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      layouts: [
        {
          id: 'default',
          name: 'Dashboard Principal',
          isDefault: true,
          widgets: [],
        },
      ],
      currentLayoutId: 'default',
      isEditMode: false,

      addLayout: (layout) => {
        const newLayout: DashboardLayout = {
          ...layout,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          layouts: [...state.layouts, newLayout],
        }));
      },

      removeLayout: (id) => {
        set((state) => ({
          layouts: state.layouts.filter((layout) => layout.id !== id),
          currentLayoutId:
            state.currentLayoutId === id
              ? state.layouts.find((l) => l.isDefault)?.id || state.layouts[0]?.id
              : state.currentLayoutId,
        }));
      },

      updateLayout: (id, updates) => {
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === id ? { ...layout, ...updates } : layout
          ),
        }));
      },

      setCurrentLayout: (id) => {
        set({ currentLayoutId: id });
      },

      addWidget: (layoutId, widget) => {
        const newWidget: Widget = {
          ...widget,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === layoutId
              ? { ...layout, widgets: [...layout.widgets, newWidget] }
              : layout
          ),
        }));
      },

      removeWidget: (layoutId, widgetId) => {
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === layoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.filter((w) => w.id !== widgetId),
                }
              : layout
          ),
        }));
      },

      updateWidget: (layoutId, widgetId, updates) => {
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === layoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.map((widget) =>
                    widget.id === widgetId ? { ...widget, ...updates } : widget
                  ),
                }
              : layout
          ),
        }));
      },

      updateWidgetPosition: (layoutId, widgetId, position) => {
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === layoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.map((widget) =>
                    widget.id === widgetId ? { ...widget, position } : widget
                  ),
                }
              : layout
          ),
        }));
      },

      setEditMode: (isEditMode) => {
        set({ isEditMode });
      },

      getCurrentLayout: () => {
        const state = get();
        return state.layouts.find((layout) => layout.id === state.currentLayoutId);
      },
    }),
    {
      name: 'dashboard-storage',
    }
  )
);
