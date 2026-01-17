export interface HomeAssistantEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  last_reported: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface EntitiesResponse {
  success: boolean;
  data: HomeAssistantEntity[];
  count: number;
}
