import { Object3D, Scene, Vector3 } from 'three';
import { Actor } from './actor';

export abstract class RigidBodyActor implements Actor {
  protected constructor(public readonly body: Object3D) {
  }

  addToScene(scene: Scene) {
    scene.add(this.body);
  }

  getPosition(): Vector3 {
    return this.body.position;
  }

  abstract update(time: number, isUserInput: boolean);

  setPosition(p: Vector3) {
    this.body.position.copy(p);
  }

  setPositionFromArray(p: number[], i: number) {
    this.body.position.set(p[i], p[i + 1], p[i + 2]);
  }

  setQuaternionFromArray(q: number[], i: number) {
    this.body.quaternion.set(q[i], q[i + 1], q[i + 2], q[i + 3]);
  }
}
