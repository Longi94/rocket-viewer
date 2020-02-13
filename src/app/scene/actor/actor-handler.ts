import { NewActor } from '../../model/replay/actor';
import { PromiseLoader } from 'rl-loadout-lib';
import { Scene } from 'three';

export abstract class ActorHandler {
  actorId: number;

  protected constructor(newActor: NewActor) {
    this.actorId = newActor.actor_id;
  }

  abstract async load(modelLoader: PromiseLoader);

  abstract addToScene(scene: Scene);

  abstract removeFromScene(scene: Scene);
}

export interface HandlerCreator {
  create: (newActor: NewActor) => ActorHandler;
}
