import { Object3D, PerspectiveCamera, Scene, Sprite, SpriteMaterial, Texture } from 'three';
import { Replay } from '../model/replay/replay';
import { BallActor } from './actor/ball';
import { PlayerActor } from './actor/player';
import { BoostPadActor } from './actor/boost-pad';
import { SpriteSheetTexture } from '../three/sprite-sheet-texture';
import { HudData } from '../model/hud-data';

export class ModelStore {
  map: Object3D;
  smallBoostPad: Object3D;
  bigBoostPad: Object3D;
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
  demoTexture: SpriteSheetTexture;

  hudData: HudData = new HudData();
}
