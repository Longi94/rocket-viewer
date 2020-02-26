import { BallData } from './ball-data';
import { PlayerData } from './player-data';
import { BoostPadData } from './boost-pad-data';

export interface FrameData {
  times: number[];
  real_times: number[];
  deltas: number[];
  ball_data: BallData;
  players: { [playerId: number]: PlayerData };
  boost_pads: { [id: number]: BoostPadData };
}
