import { Trajectory } from './trajectory';

export interface NewActor {
  actor_id: number;
  name_id: number;
  object_id: number;
  initial_trajectory: Trajectory;
}

export interface UpdatedActor {
  actor_id: number;
  stream_id: number;
  object_id: number;
  attribute: { [name: string]: any };
}
