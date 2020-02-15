import { PromiseLoader } from 'rl-loadout-lib';
import { ReplayScene } from '../replay-scene';
import { applyEnvMap } from '../../util/three';

const MAPPING = {
  'HoopsStadium_P': '/assets/models/HoopsStadium_P.draco.glb'
};


export async function loadMap(name: string, modelLoader: PromiseLoader, rs: ReplayScene) {
  const mapUrl = MAPPING[name];
  rs.models.map = (await modelLoader.load(mapUrl)).scene;
  applyEnvMap(rs.models.map, rs.envMap);
}
