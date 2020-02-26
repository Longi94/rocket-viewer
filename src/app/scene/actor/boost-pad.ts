import { Object3D } from 'three';
import { BoostPad } from '../../model/boost-pad';
import { RigidBodyActor } from './rigid-body';

export class BoostPadActor extends RigidBodyActor {

  glow: Object3D;

  constructor(body: Object3D, big: boolean) {
    super(body);
    if (big) {
      this.glow = body.getObjectByName("BoostPad_Large_Glow");
    } else {
      this.glow = body.getObjectByName("BoostPad_Small_Glow");
    }
  }

  static create(boostPad: BoostPad, bigModel: Object3D, smallModel: Object3D) {
    const model = boostPad.big ? bigModel.clone(true) : smallModel.clone(true);
    model.position.copy(boostPad.position);
    model.rotation.copy(boostPad.rotation);
    return new BoostPadActor(model, boostPad.big);
  }

  update(time: number, isUserInput: boolean) {
  }
}
