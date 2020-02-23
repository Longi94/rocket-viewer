import { RigidBodyActor } from './rigid-body';
import { PlayerData } from '../../model/replay/player-data';
import { Nameplate } from '../object/nameplate';
import { BodyModel } from 'rl-loadout-lib';
import { Group, Object3D, PerspectiveCamera } from 'three';

export class PlayerActor extends RigidBodyActor {

  private readonly nameplate: Nameplate;
  readonly car: Object3D;

  constructor(playerData: PlayerData, body: BodyModel) {
    super(new Group());
    this.car = body.scene;
    this.body.add(body.scene);
    this.nameplate = new Nameplate(playerData.name, playerData.team);
    this.body.add(this.nameplate.sprite);
  }

  update(time: number) {
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
}
