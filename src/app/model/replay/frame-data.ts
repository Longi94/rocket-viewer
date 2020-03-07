/* tslint:disable:variable-name */

import { BallData } from './ball-data';
import { PlayerData } from './player-data';
import { BoostPadData } from './boost-pad-data';
import { GameData } from './game-data';
import { TeamData } from './team-data';

export interface FrameData {
  times: number[];
  real_times: number[];
  deltas: number[];
  ball_data: BallData;
  players: { [playerId: number]: PlayerData };
  boost_pads: { [id: number]: BoostPadData };
  game_data: GameData;
  team_0_data: TeamData;
  team_1_data: TeamData;
}
