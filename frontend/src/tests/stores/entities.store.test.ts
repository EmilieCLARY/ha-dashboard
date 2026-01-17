import { describe, it, expect } from 'vitest';
import { useEntitiesStore } from '../../stores/entities.store';

describe('Entities Store', () => {
  it('initializes with empty state', () => {
    const store = useEntitiesStore.getState();
    
    expect(store.entities).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.wsConnected).toBe(false);
    expect(store.haConnected).toBe(false);
  });

  it('sets loading state', () => {
    const { setLoading } = useEntitiesStore.getState();
    
    setLoading(true);
    expect(useEntitiesStore.getState().loading).toBe(true);
    
    setLoading(false);
    expect(useEntitiesStore.getState().loading).toBe(false);
  });

  it('sets error message', () => {
    const { setError } = useEntitiesStore.getState();
    
    setError('Test error');
    expect(useEntitiesStore.getState().error).toBe('Test error');
    
    setError(null);
    expect(useEntitiesStore.getState().error).toBeNull();
  });

  it('sets entities', () => {
    const { setEntities } = useEntitiesStore.getState();
    
    const mockEntities = [
      {
        entity_id: 'sensor.temperature',
        state: '22.5',
        attributes: {},
        last_changed: '2026-01-17T10:00:00Z',
        last_updated: '2026-01-17T10:00:00Z',
        last_reported: '2026-01-17T10:00:00Z',
        context: { id: '1', parent_id: null, user_id: null },
      },
    ];
    
    setEntities(mockEntities);
    expect(useEntitiesStore.getState().entities).toEqual(mockEntities);
  });

  it('updates single entity', () => {
    const { setEntities, updateEntity } = useEntitiesStore.getState();
    
    // Setup initial entities
    const mockEntities = [
      {
        entity_id: 'sensor.temperature',
        state: '22.5',
        attributes: {},
        last_changed: '2026-01-17T10:00:00Z',
        last_updated: '2026-01-17T10:00:00Z',
        last_reported: '2026-01-17T10:00:00Z',
        context: { id: '1', parent_id: null, user_id: null },
      },
      {
        entity_id: 'sensor.humidity',
        state: '65',
        attributes: {},
        last_changed: '2026-01-17T10:00:00Z',
        last_updated: '2026-01-17T10:00:00Z',
        last_reported: '2026-01-17T10:00:00Z',
        context: { id: '2', parent_id: null, user_id: null },
      },
    ];
    
    setEntities(mockEntities);
    
    // Update temperature
    const updatedEntity = {
      ...mockEntities[0],
      state: '23.0',
      last_updated: '2026-01-17T10:05:00Z',
    };
    
    updateEntity(updatedEntity);
    
    const state = useEntitiesStore.getState();
    const tempEntity = state.entities.find(e => e.entity_id === 'sensor.temperature');
    
    expect(tempEntity?.state).toBe('23.0');
    expect(state.entities.length).toBe(2); // Should still have 2 entities
  });

  it('adds new entity when updating non-existent entity', () => {
    const { setEntities, updateEntity } = useEntitiesStore.getState();
    
    // Setup with one entity
    setEntities([
      {
        entity_id: 'sensor.temperature',
        state: '22.5',
        attributes: {},
        last_changed: '2026-01-17T10:00:00Z',
        last_updated: '2026-01-17T10:00:00Z',
        last_reported: '2026-01-17T10:00:00Z',
        context: { id: '1', parent_id: null, user_id: null },
      },
    ]);
    
    // Add new entity via update
    const newEntity = {
      entity_id: 'sensor.pressure',
      state: '1013',
      attributes: {},
      last_changed: '2026-01-17T10:00:00Z',
      last_updated: '2026-01-17T10:00:00Z',
      last_reported: '2026-01-17T10:00:00Z',
      context: { id: '3', parent_id: null, user_id: null },
    };
    
    updateEntity(newEntity);
    
    const state = useEntitiesStore.getState();
    expect(state.entities.length).toBe(2);
    expect(state.entities.find(e => e.entity_id === 'sensor.pressure')).toBeDefined();
  });

  it('sets WebSocket connection status', () => {
    const { setWsConnected } = useEntitiesStore.getState();
    
    setWsConnected(true);
    expect(useEntitiesStore.getState().wsConnected).toBe(true);
    
    setWsConnected(false);
    expect(useEntitiesStore.getState().wsConnected).toBe(false);
  });

  it('sets Home Assistant connection status', () => {
    const { setHaConnected } = useEntitiesStore.getState();
    
    setHaConnected(true);
    expect(useEntitiesStore.getState().haConnected).toBe(true);
    
    setHaConnected(false);
    expect(useEntitiesStore.getState().haConnected).toBe(false);
  });

  it('clears all entities', () => {
    const { setEntities } = useEntitiesStore.getState();
    
    // Add entities
    setEntities([
      {
        entity_id: 'sensor.temperature',
        state: '22.5',
        attributes: {},
        last_changed: '2026-01-17T10:00:00Z',
        last_updated: '2026-01-17T10:00:00Z',
        last_reported: '2026-01-17T10:00:00Z',
        context: { id: '1', parent_id: null, user_id: null },
      },
    ]);
    
    // Clear
    setEntities([]);
    expect(useEntitiesStore.getState().entities).toEqual([]);
  });
});
