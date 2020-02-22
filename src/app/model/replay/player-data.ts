import { BodyStates } from './body-states';
import { PlayerLoadouts } from './player-loadout';
import { PlayerLoadoutsPaints } from './player-loadout-paints';
import { TeamPaint } from './team-paint';

export interface PlayerData {
  id: number;
  name: string;
  team: number;
  body_states: BodyStates;
  loadouts: PlayerLoadouts;
  paints: PlayerLoadoutsPaints;
  team_paint_blue: TeamPaint;
  team_paint_orange: TeamPaint;
}
