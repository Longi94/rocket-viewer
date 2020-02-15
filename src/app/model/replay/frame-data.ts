import { BallData } from './ball-data';
import { PlayerData } from './player-data';

export interface FrameData {
  times: number[];
  deltas: number[];
  ball_data: BallData;
  players: { [player_id: number]: PlayerData }
}
