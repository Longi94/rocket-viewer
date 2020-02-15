import { PromiseLoader } from 'rl-loadout-lib';
import { ReplayScene } from '../replay-scene';
import { applyEnvMap } from '../../util/three';

const BALL_MAPPING = {
  'Basketball': '/assets/models/basketball.draco.glb'
};

export async function loadBall(type: string, modelLoader: PromiseLoader, rs: ReplayScene) {
  rs.models.ball = (await modelLoader.load(BALL_MAPPING[type])).scene;
  applyEnvMap(rs.models.ball, rs.envMap);
}
