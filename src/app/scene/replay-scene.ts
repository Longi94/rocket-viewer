import { Object3D, PerspectiveCamera, Scene, Sprite, Texture, WebGLRenderer } from 'three';
import { Replay } from '../model/replay/replay';
import { BallActor } from './actor/ball';
import { PlayerActor } from './actor/player';

export class ModelStore {
  map: Object3D;
}


export class ReplayScene {
  models: ModelStore = new ModelStore();
  ballActor: BallActor;
  players: { [playerId: number]: PlayerActor } = {};
  replay: Replay;
  scene: Scene;
  envMap: Texture;
  camera: PerspectiveCamera;

  // boost
  boostSprite: Sprite;
}
