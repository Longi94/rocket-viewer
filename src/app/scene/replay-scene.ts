import { Object3D, Scene, Texture } from 'three';
import { Replay } from '../model/replay/replay';
import { BodyModel } from 'rl-loadout-lib';
import { Actor } from './actor/actor';
import { BallActor } from './actor/ball';
import { PlayerActor } from './actor/player';

export class ModelStore {
  map: Object3D;
}


export class ReplayScene {
  models: ModelStore = new ModelStore();
  ball_actor: BallActor;
  players: { [player_id: number]: PlayerActor } = {};
  replay: Replay;
  scene: Scene;
  envMap: Texture;
}
