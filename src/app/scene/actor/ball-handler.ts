import { ThreeSceneHandler } from './three-scene-handler';
import { HandlerCreator } from './actor-handler';
import { NewActor } from '../../model/replay/actor';
import { PromiseLoader } from 'rl-loadout-lib';

export abstract class BallHandler extends ThreeSceneHandler {
}

export class BasketBallHandler extends BallHandler {
  async load(modelLoader: PromiseLoader) {
    const gltf = await modelLoader.load('/assets/models/basketball.draco.glb');
    this.scene = gltf.scene;
    this.scene.position.copy(this.position);
    this.scene.rotation.copy(this.rotation);
  }
}

export const BasketBallHandlerCreator: HandlerCreator = {
  create: (newActor: NewActor): BasketBallHandler => {
    const handler = new BasketBallHandler(newActor);
    return handler;
  }
};
