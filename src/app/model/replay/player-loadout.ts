/* tslint:disable:variable-name */

export interface PlayerLoadouts {
  blue: PlayerLoadout;
  orange?: PlayerLoadout;
}

export interface PlayerLoadout {
  body: number;
  decal: number;
  wheels: number;
  boost: number;
  antenna: number;
  topper: number;
  engine_audio: number;
  trail: number;
  goal_explosion: number;
  banner: number;
}
