export interface NetCache {
  object_ind: number;
  parent_id: number;
  cache_id: number;
  properties: CacheProperty[];
}

export interface CacheProperty {
  object_ind: number;
  stream_id: number;
}
