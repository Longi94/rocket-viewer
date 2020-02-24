import { RigidBodyActor } from './rigid-body';
import { PlayerData } from '../../model/replay/player-data';
import { Nameplate } from '../object/nameplate';
import { BodyModel } from 'rl-loadout-lib';
import { Camera, Group, Object3D, PerspectiveCamera, Sprite, Vector3, WebGLRenderer } from 'three';
import { BoostEmitter } from '../object/boost-emitter';
import { ReplayScene } from '../replay-scene';
import { Emitter } from 'three-nebula';
import { BoostData } from '../../model/replay/boost-data';

export class PlayerActor extends RigidBodyActor {

  private readonly nameplate: Nameplate;
  private boost: BoostEmitter;
  readonly car: Object3D;

  private readonly boostPos = new Vector3();
  private readonly boostData: BoostData;

  constructor(playerData: PlayerData, body: BodyModel, rs: ReplayScene) {
    super(new Group());
    this.car = body.scene;
    this.body.add(body.scene);
    this.nameplate = new Nameplate(playerData.name, playerData.team);
    this.body.add(this.nameplate.sprite);
    this.boostData = playerData.boost_data;
  }

  update(time: number) {
    this.boostPos.set(0, 0, 0);
    this.car.localToWorld(this.boostPos);
    if (this.boost != undefined) {
      this.boost.update(time, this.boostPos);
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

  createBoost(emitter: Emitter, sprite: Sprite, camera: Camera, renderer: WebGLRenderer) {
    this.boost = new BoostEmitter(emitter, sprite, camera, renderer, this.boostData.active, this.boostData.times);
  }
}
