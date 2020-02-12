import { Location } from './location';
import { Rotation } from './rotation';

export interface Trajectory {
  location?: Location;
  rotation?: Rotation;
}
