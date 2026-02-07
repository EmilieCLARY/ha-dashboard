import { create } from 'zustand';
import { HomeAssistantEntity } from '../types/homeAssistant';
import { apiService } from '../services/api.service';
import { wsService, StateChangedEvent } from '../services/websocket.service';

interface EntitiesState {
  entities: HomeAssistantEntity[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  wsConnected: boolean;
  haConnected: boolean;

  // Actions
  fetchEntities: () => Promise<void>;
  updateEntity: (entityId: string, newState: Partial<HomeAssistantEntity>) => void;
  getEntity: (entityId: string) => HomeAssistantEntity | undefined;
  getEntityById: (entityId: string) => HomeAssistantEntity | undefined;
  getEntitiesByDomain: (domain: string) => HomeAssistantEntity[];
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

export const useEntitiesStore = create<EntitiesState>((set, get) => ({
  entities: [],
  loading: false,
  error: null,
  lastUpdate: null,
  wsConnected: false,
  haConnected: false,

  fetchEntities: async () => {
    set({ loading: true, error: null });
    try {
      const entities = await apiService.getEntities();
      set({
        entities,
        loading: false,
        lastUpdate: new Date(),
        haConnected: true,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch entities',
        haConnected: false,
      });
    }
  },

  updateEntity: (entityId: string, newState: Partial<HomeAssistantEntity>) => {
    set((state) => ({
      entities: state.entities.map((entity) =>
        entity.entity_id === entityId ? { ...entity, ...newState } : entity
      ),
      lastUpdate: new Date(),
    }));
  },

  getEntity: (entityId: string) => {
    return get().entities.find((e) => e.entity_id === entityId);
  },

  getEntityById: (entityId: string) => {
    return get().entities.find((e) => e.entity_id === entityId);
  },

  getEntitiesByDomain: (domain: string) => {
    return get().entities.filter((e) => e.entity_id.startsWith(`${domain}.`));
  },

  connectWebSocket: () => {
    wsService.connect();

    // Listen for connection status
    wsService.on('connect', () => {
      set({ wsConnected: true });
    });

    wsService.on('disconnect', () => {
      set({ wsConnected: false });
    });

    wsService.on('ha_connected', () => {
      set({ haConnected: true });
    });

    wsService.on('ha_disconnected', () => {
      set({ haConnected: false });
    });

    // Listen for state changes
    wsService.on('state_changed', (data: StateChangedEvent) => {
      const { entity_id, new_state } = data;
      get().updateEntity(entity_id, {
        state: new_state.state,
        attributes: new_state.attributes,
        last_changed: new_state.last_changed,
        last_updated: new_state.last_updated,
      });
    });

    // Listen for errors
    wsService.on('error', (error: Error) => {
      set({ error: error.message });
    });
  },

  disconnectWebSocket: () => {
    wsService.disconnect();
    set({ wsConnected: false });
  },
}));
