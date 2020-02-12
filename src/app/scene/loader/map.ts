import { PromiseLoader } from 'rl-loadout-lib';

const MAPPING = {
  'HoopsStadium_P': '/assets/models/HoopsStadium_P.draco.glb'
};


export async function loadMap(name: string, modelLoader: PromiseLoader) {
  const mapUrl = MAPPING[name];
  return await modelLoader.load(mapUrl);
}
