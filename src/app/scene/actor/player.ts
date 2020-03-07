import { RigidBodyActor } from './rigid-body';
import { PlayerData } from '../../model/replay/player-data';
import { Nameplate } from '../object/nameplate';
import { BodyModel } from 'rl-loadout-lib';
import { AdditiveBlending, Camera, Group, Object3D, PerspectiveCamera, Scene, Sprite, SpriteMaterial, Vector3, WebGLRenderer } from 'three';
import { BoostEmitter } from '../object/boost-emitter';
import { Emitter } from 'three-nebula';
import { BoostData } from '../../model/replay/boost-data';
import { RenderOrder } from '../../three/render-order';
import { SpriteSheetTexture } from '../../three/sprite-sheet-texture';

export class PlayerActor extends RigidBodyActor {

  private readonly nameplate: Nameplate;
  private boost: BoostEmitter;
  readonly jumpSprite: Sprite;

  private readonly boostJoint: Object3D;
  readonly car: Object3D;

  private readonly boostPos = new Vector3();
  private readonly boostData: BoostData;

  readonly demoSprite: Sprite;
  demoTexture: SpriteSheetTexture;

  constructor(playerData: PlayerData, public readonly bodyModel: BodyModel) {
    super(new Group());
    this.car = bodyModel.scene;
    this.body.add(bodyModel.scene);

    this.nameplate = new Nameplate(playerData.name, playerData.team);
    this.body.add(this.nameplate.sprite);

    this.boostData = playerData.boost_data;
    this.boostJoint = this.car.getObjectByName('RocketBoost');

    this.jumpSprite = new Sprite();
    this.jumpSprite.scale.setScalar(80);
    this.jumpSprite.position.y = -10;
    this.jumpSprite.visible = false;
    this.jumpSprite.renderOrder = RenderOrder.JUMP_EFFECT;
    this.car.add(this.jumpSprite);

    this.demoSprite = new Sprite(new SpriteMaterial({blending: AdditiveBlending, depthWrite: false, transparent: true}));
    this.demoSprite.scale.setScalar(750);
    this.demoSprite.visible = false;
    this.demoSprite.renderOrder = RenderOrder.DEMOLITION;
  }

  addToScene(scene: Scene) {
    super.addToScene(scene);
    scene.add(this.demoSprite);
  }

  update(time: number, isUserInput: boolean) {
    if (this.boost != undefined) {
      if (this.boostJoint != undefined) {
        this.boostPos.set(0, 0, 0);
        this.boostJoint.localToWorld(this.boostPos);
      } else {
        this.boostPos.set(-48.505, 9, 0); // octane boost pos
        this.car.localToWorld(this.boostPos);
      }
      this.boost.update(time, this.boostPos, isUserInput);
    }
    if (this.demoSprite.visible && this.demoTexture != undefined) {
      this.demoTexture.update();
    }
  }

  nameplateVisible(visible: boolean) {
    this.nameplate.sprite.visible = visible;
  }

  updateNameplate(camera: PerspectiveCamera) {
    this.nameplate.update(camera);
  }

  setQuaternionFromArray(q: number[], i: number) {
    this.car.quaternion.set(q[i], q[i + 1], q[i + 2], q[i + 3]);
  }

  createBoost(emitter: Emitter, sprite: Sprite, camera: Camera, renderer: WebGLRenderer, team: number) {
    this.boost = new BoostEmitter(emitter, sprite, camera, renderer, this.boostData.active, this.boostData.times, team);
  }

  setJumpSprite(material: SpriteMaterial) {
    this.jumpSprite.material = material;
    this.jumpSprite.material.needsUpdate = true;
  }

  setDemoSprite(demoTexture: SpriteSheetTexture) {
    this.demoTexture = demoTexture.clone();
    this.demoSprite.material.map = this.demoTexture.texture;
    this.demoSprite.material.needsUpdate = true;
  }
}
