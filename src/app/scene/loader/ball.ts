import { ActorLoader } from './actor';
import { PromiseLoader } from 'rl-loadout-lib';
import { ModelStore } from '../replay-scene';
import { applyEnvMap } from '../../util/three';
import { Texture } from 'three';

export const BasketBallLoader: ActorLoader = {
  async load(modelLoader: PromiseLoader, modelStore: ModelStore, envMap: Texture) {
    modelStore.ball = (await modelLoader.load('/assets/models/basketball.draco.glb')).scene;
    applyEnvMap(modelStore.ball, envMap);
  }
};
