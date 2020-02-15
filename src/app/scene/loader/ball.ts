import { ReplayScene } from '../replay-scene';
import { applyEnvMap } from '../../util/three';
import { modelLoader } from './loader-config';

const BALL_MAPPING = {
  'Basketball': '/assets/models/basketball.draco.glb'
};

export async function loadBall(type: string, rs: ReplayScene) {
  rs.models.ball = (await modelLoader.load(BALL_MAPPING[type])).scene;
  applyEnvMap(rs.models.ball, rs.envMap);
}
