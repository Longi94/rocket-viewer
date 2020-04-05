import { ReplayScene } from '../replay-scene';
import { modelLoader } from './loader-config';
import { BallActor } from '../actor/ball';
import { BallType } from '../../model/replay/ball-data';
import { RenderOrder } from '../../three/render-order';

const DEFAULT = '/assets/models/balls/ball_default.draco.glb';

const BALL_MAPPING = {
  Basketball: '/assets/models/balls/ball_basketball.draco.glb'
};

export async function loadBall(type: BallType, rs: ReplayScene) {
  let url = BALL_MAPPING[type];
  if (url == undefined) {
    url = DEFAULT;
  }
  const model = (await modelLoader.load(url)).scene.children[0];
  model.renderOrder = RenderOrder.OPAQUE;
  rs.ballActor = new BallActor(rs.replay.frame_data.ball_data, type, model, rs.scene);
}
