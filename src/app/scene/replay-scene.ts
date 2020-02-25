import { Object3D, PerspectiveCamera, Scene, Sprite, SpriteMaterial, Texture, WebGLRenderer } from 'three';
import { Replay } from '../model/replay/replay';
import { BallActor } from './actor/ball';
import { PlayerActor } from './actor/player';
import { BoostPadActor } from './actor/boost-pad';

export class ModelStore {
  map: Object3D;
  smallBoostPad: Object3D;
  bigBoostPad: Object3D;
  bigBoostSprite: Sprite;
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

  jumpMaterial: SpriteMaterial;

  boostPads: BoostPadActor[] = [];
}
