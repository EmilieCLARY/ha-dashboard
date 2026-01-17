import type { HomeAssistantEntity } from '../types/homeAssistant';

/**
 * Helper function to create test entities with default values for required fields
 */
export function createTestEntity(
  overrides: Partial<HomeAssistantEntity> = {}
): HomeAssistantEntity {
  return {
    entity_id: 'sensor.test',
    state: 'unknown',
    attributes: {},
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    last_reported: new Date().toISOString(),
    context: {
      id: '1',
      parent_id: null,
      user_id: null,
    },
    ...overrides,
  };
}
