import { NewActor } from '../../model/replay/actor';

export class ActorHandler {
  actorId: number;

  constructor(newActor: NewActor) {
    this.actorId = newActor.actor_id;
  }
}

export interface HandlerCreator {
  create: (newActor: NewActor) => ActorHandler;
}
