import { ReplayScene } from '../replay-scene';
import { applyEnvMap } from '../../util/three';
import { modelLoader } from './loader-config';
import { BallActor } from '../actor/ball';
import { BallType } from '../../model/replay/ball-data';

const DEFAULT = '/assets/models/balls/ball_default.draco.glb';

const BALL_MAPPING = {
  Basketball: '/assets/models/balls/ball_basketball.draco.glb'
};

export async function loadBall(type: BallType, rs: ReplayScene) {
  let url = BALL_MAPPING[type];
  if (url == undefined) {
    url = DEFAULT;
  }
  rs.ballActor = new BallActor(type, (await modelLoader.load(url)).scene.children[0]);
  applyEnvMap(rs.ballActor.body, rs.envMap);
}
