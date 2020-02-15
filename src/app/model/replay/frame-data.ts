import { BallData } from './ball-data';

export interface FrameData {
  times: number[];
  deltas: number[];
  ball_data: BallData;
}
