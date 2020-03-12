import { Object3D } from 'three';

export class HudData extends Object3D {
  remainingSeconds = 300;
  scoreBlue = 0;
  scoreOrange = 0;
  boost = 0;
}
