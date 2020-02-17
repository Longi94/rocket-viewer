import { Object3D, Scene, Texture } from 'three';
import { Replay } from '../model/replay/replay';
import { BodyModel } from 'rl-loadout-lib';

export class ModelStore {
  map: Object3D;
  ball: Object3D;
  players: { [player_id: number]: BodyModel } = {};
}


export class ReplayScene {
  models: ModelStore = new ModelStore();
  replay: Replay;
  scene: Scene;
  envMap: Texture;
}
