import { ReplayScene } from '../replay-scene';
import { applyEnvMap } from '../../util/three';
import { modelLoader } from './loader-config';

const MAPPING = {
  'HoopsStadium_P': '/assets/models/HoopsStadium_P.draco.glb'
};


export async function loadMap(name: string, rs: ReplayScene) {
  const mapUrl = MAPPING[name];
  rs.models.map = (await modelLoader.load(mapUrl)).scene;
  applyEnvMap(rs.models.map, rs.envMap);
}
