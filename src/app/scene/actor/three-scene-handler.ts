import { ActorHandler } from './actor-handler';
import { Euler, Scene, Vector3 } from 'three';
import { NewActor } from '../../model/replay/actor';
import { locationToVector3, rotationToEuler } from '../../util/replay';

export abstract class ThreeSceneHandler extends ActorHandler {
  position: Vector3 = new Vector3();
  rotation: Euler = new Euler();
  scene: Scene;

  constructor(newActor: NewActor) {
    super(newActor);

    this.position = locationToVector3(newActor.initial_trajectory.location);
    this.rotation = rotationToEuler(newActor.initial_trajectory.rotation);
  }

  addToScene(scene: Scene) {
    scene.add(this.scene);
  }

  removeFromScene(scene: Scene) {
    scene.remove(this.scene);
  }
}
