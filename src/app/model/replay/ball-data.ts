/* tslint:disable:variable-name */

import { BodyStates } from './body-states';

export enum BallType {
  UNKNOWN = 'Unknown',
  DEFAULT = 'Default',
  BASKETBALL = 'Basketball',
  PUCK = 'Puck',
  CUBE = 'Cube',
  BREAKOUT = 'Breakout',
}

export interface BallData {
  ball_type: BallType;
  body_states: BodyStates;
}
