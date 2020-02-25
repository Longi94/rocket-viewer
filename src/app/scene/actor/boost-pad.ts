import { Object3D, Sprite } from 'three';
import { BoostPad } from '../../model/boost-pad';
import { RigidBodyActor } from './rigid-body';

export class BoostPadActor extends RigidBodyActor {

  static create(boostPad: BoostPad, bigModel: Object3D, smallModel: Object3D) {
    const model = boostPad.big ? bigModel.clone(true) : smallModel.clone(true);
    model.position.copy(boostPad.position);
    model.rotation.copy(boostPad.rotation);
    return new BoostPadActor(model);
  }

  update(time: number, isUserInput: boolean) {
  }
}
