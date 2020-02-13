import { NewActor } from '../../model/replay/actor';
import { ReplayScene } from '../replay-scene';

export abstract class ActorHandler {

  protected constructor(protected replayScene: ReplayScene) {
  }

  abstract create(newActor: NewActor);

  abstract update();

  abstract delete()
}

export interface HandlerCreator {
  create: (replayScene: ReplayScene) => ActorHandler;
}
