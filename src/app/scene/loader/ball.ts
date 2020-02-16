import { ReplayScene } from '../replay-scene';
import { applyEnvMap } from '../../util/three';
import { modelLoader } from './loader-config';

const DEFAULT = '/assets/models/balls/ball_default.draco.glb';

const BALL_MAPPING = {
  'Basketball': '/assets/models/balls/ball_basketball.draco.glb'
};

export async function loadBall(type: string, rs: ReplayScene) {
  let url = BALL_MAPPING[type];
  if (url == undefined) {
    url = DEFAULT;
  }
  rs.models.ball = (await modelLoader.load(url)).scene;
  applyEnvMap(rs.models.ball, rs.envMap);
}
