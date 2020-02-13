import { PromiseLoader } from 'rl-loadout-lib';
import { ModelStore } from '../replay-scene';

export interface ActorLoader {
  load(modelLoader: PromiseLoader, modelStore: ModelStore): Promise<any>;
}
