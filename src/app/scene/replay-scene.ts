import { Object3D, Scene, Texture } from 'three';
import { Replay } from '../model/replay/replay';
import { BodyModel } from 'rl-loadout-lib';
import { Actor } from './actor/actor';
import { BallActor } from './actor/ball';

export class ModelStore {
  map: Object3D;
  players: { [player_id: number]: BodyModel } = {};
}


export class ReplayScene {
  models: ModelStore = new ModelStore();
  ball_actor: BallActor;
  replay: Replay;
  scene: Scene;
  envMap: Texture;
}
