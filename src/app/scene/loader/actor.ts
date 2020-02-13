import { PromiseLoader } from 'rl-loadout-lib';
import { ModelStore } from '../replay-scene';
import { Texture } from 'three';

export interface ActorLoader {
  load(modelLoader: PromiseLoader, modelStore: ModelStore, envMap: Texture): Promise<any>;
}
