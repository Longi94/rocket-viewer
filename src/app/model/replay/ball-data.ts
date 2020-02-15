import { Position } from './location';
import { Quaternion } from './rotation';

export interface BallData {
  ball_type: string;
  positions: Position;
  rotations: Quaternion;
}
