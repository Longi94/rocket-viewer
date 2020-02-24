import { BodyStates } from './body-states';
import { PlayerLoadouts } from './player-loadout';
import { PlayerLoadoutsPaints } from './player-loadout-paints';
import { TeamPaint } from './team-paint';
import { BoostData } from './boost-data';

export interface PlayerData {
  id: number;
  name: string;
  team: number;
  body_states: BodyStates;
  loadouts: PlayerLoadouts;
  paints: PlayerLoadoutsPaints;
  team_paint_blue: TeamPaint;
  team_paint_orange: TeamPaint;
  boost_data: BoostData;
}
