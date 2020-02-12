import { NewActor, UpdatedActor } from './actor';

export interface NetworkFrames {
  frames: Frame[];
}

export interface Frame {
  time: number;
  delta: number;
  new_actors: NewActor[];
  deleted_actors: UpdatedActor[];
  updated_actors: number[];
}
