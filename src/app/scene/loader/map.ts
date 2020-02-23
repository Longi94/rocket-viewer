import { ReplayScene } from '../replay-scene';
import { applyEnvMap } from '../../util/three';
import { modelLoader } from './loader-config';

const MAPPING = {
  'HoopsStadium_P': '/assets/models/maps/HoopsStadium_P.draco.glb'
};


export async function loadMap(name: string, rs: ReplayScene) {
  let mapUrl = MAPPING[name];
  if (mapUrl == undefined) {
    mapUrl = '/assets/models/maps/TrainStation_Night_P.draco.glb'
  }
  rs.models.map = (await modelLoader.load(mapUrl)).scene;
  applyEnvMap(rs.models.map, rs.envMap);
}
