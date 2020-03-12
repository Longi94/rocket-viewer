import { Object3D, PerspectiveCamera, Scene, Sprite, SpriteMaterial, Texture } from 'three';
import { Replay } from '../model/replay/replay';
import { BallActor } from './actor/ball';
import { PlayerActor } from './actor/player';
import { BoostPadActor } from './actor/boost-pad';
import { SpriteSheetTexture } from '../three/sprite-sheet-texture';
import { HudData } from '../model/hud-data';
import { clearObject3D, disposeObject } from '../util/three';

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

  reset() {
    clearObject3D(this.scene);
    this.scene.dispose();
    this.replay = undefined;

    disposeObject(this.models.bigBoostPad);
    disposeObject(this.models.smallBoostPad);

    this.models = new ModelStore();
    this.ballActor.dispose();
    this.ballActor = undefined;
    for (const player of Object.values(this.players)) {
      player.dispose();
    }
    this.players = {};

    for (const pad of this.boostPads) {
      pad.dispose();
    }
    this.boostPads = [];

    this.boostSprite.geometry.dispose();
    this.boostSprite.material.dispose();
    this.boostSprite = undefined;

    this.demoTexture.dispose();

    this.hudData = new HudData();
  }
}
