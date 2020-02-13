import { ActorHandler } from './actor-handler';
import { Euler, Scene, Vector3 } from 'three';
import { NewActor } from '../../model/replay/actor';
import { locationToVector3, rotationToEuler } from '../../util/replay';
import { ReplayScene } from '../replay-scene';

export class ThreeSceneHandler extends ActorHandler {
  position: Vector3 = new Vector3();
  rotation: Euler = new Euler();

  constructor(replayScene: ReplayScene) {
    super(replayScene);
  }

  create(newActor: NewActor) {
    this.position = locationToVector3(newActor.initial_trajectory.location);
    this.rotation = rotationToEuler(newActor.initial_trajectory.rotation);

    this.replayScene.models.ball.position.copy(this.position);
    this.replayScene.models.ball.rotation.copy(this.rotation);
    this.replayScene.scene.add(this.replayScene.models.ball);
  }

  delete() {
    this.replayScene.scene.remove(this.replayScene.models.ball);
  }

  update() {
  }
}
