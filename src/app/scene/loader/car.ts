import { PlayerData } from '../../model/replay/player-data';
import { ReplayScene } from '../replay-scene';
import { DEFAULT_PAINT_CONFIG, RocketManager } from './loader-config';
import { Body, Wheel } from 'rl-loadout-lib';


export async function loadCar(playerData: PlayerData, rs: ReplayScene) {
  const bodyTask = RocketManager.loadBody(Body.DEFAULT.id, DEFAULT_PAINT_CONFIG);
  const wheelsTask = RocketManager.loadWheel(Wheel.DEFAULT.id, DEFAULT_PAINT_CONFIG);

  const body = await bodyTask;
  //const wheels = await wheelsTask;
  body.setEnvMap(rs.envMap);
  //wheels.setEnvMap(rs.envMap);
  //body.addWheelsModel(wheels);

  rs.models.players[playerData.id] = body;
}
