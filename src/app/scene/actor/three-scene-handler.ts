import { ActorHandler } from './actor-handler';
import { Euler, Vector3 } from 'three';
import { NewActor } from '../../model/replay/actor';
import { copyFromLocation, interpolateLocation, locationToVector3, rotationToEuler } from '../../util/replay';
import { ReplayScene } from '../replay-scene';
import { Frame } from '../../model/replay/frame';
import { Trajectory } from '../../model/replay/trajectory';
import { Location } from '../../model/replay/location';

export class ThreeSceneHandler extends ActorHandler {
  position: Vector3 = new Vector3();
  rotation: Euler = new Euler();

  initial: Trajectory;

  constructor(replayScene: ReplayScene) {
    super(replayScene);
  }

  create(newActor: NewActor) {
    super.create(newActor);
    this.initial = newActor.initial_trajectory;
    this.position = locationToVector3(this.initial.location);
    this.rotation = rotationToEuler(this.initial.rotation);

    this.replayScene.models.ball.position.copy(this.position);
    this.replayScene.models.ball.rotation.copy(this.rotation);
    this.replayScene.scene.add(this.replayScene.models.ball);
  }

  delete() {
    this.replayScene.scene.remove(this.replayScene.models.ball);
  }

  update(time: number, currentFrame: number, frames: Frame[], realFrameTimes: number[]) {
    let rigidBody = undefined;

    for (let i = currentFrame; i >= 0; i--) {
      rigidBody = this.findUpdatedAttribute('RigidBody', frames[i]);
      if (rigidBody != undefined) {
        break;
      }
    }

    const prevPos: Location = rigidBody == undefined ? this.initial.location : rigidBody.location;

    let nextRigidBody = this.findUpdatedAttribute('RigidBody', frames[currentFrame + 1]);

    if (nextRigidBody == undefined) {
      copyFromLocation(this.position, prevPos, this.replayScene.replay.net_version);
    } else {
      // interpolate
      const p = (time - realFrameTimes[currentFrame]) / (realFrameTimes[currentFrame + 1] - realFrameTimes[currentFrame]);
      interpolateLocation(this.position, prevPos, nextRigidBody.location, p, this.replayScene.replay.net_version);
    }

    this.replayScene.models.ball.position.copy(this.position);
  }

  private findUpdatedAttribute(name: string, frame: Frame) {
    if (frame == undefined) {
      return undefined;
    }
    const actor = frame.updated_actors.find(updated => {
      return updated.actor_id === this.actorId && name in updated.attribute;
    });

    if (actor != undefined) {
      return actor.attribute[name];
    }
    return undefined;
  }
}
