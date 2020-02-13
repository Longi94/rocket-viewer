import { NewActor } from '../../model/replay/actor';
import { ReplayScene } from '../replay-scene';
import { Frame } from '../../model/replay/frame';

export abstract class ActorHandler {
  protected actorId: number;

  protected constructor(protected replayScene: ReplayScene) {
  }

  create(newActor: NewActor) {
    this.actorId = newActor.actor_id;
  }

  abstract update(time: number, currentFrame: number, frames: Frame[], realFrameTimes: number[]);

  abstract delete()
}

export interface HandlerCreator {
  create: (replayScene: ReplayScene) => ActorHandler;
}
