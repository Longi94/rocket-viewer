import { ActorLoader } from './actor';
import { PromiseLoader } from 'rl-loadout-lib';
import { ModelStore } from '../replay-scene';

export const BasketBallLoader: ActorLoader = {
  async load(modelLoader: PromiseLoader, modelStore: ModelStore) {
    modelStore.ball = (await modelLoader.load('/assets/models/basketball.draco.glb')).scene;
  }
};
