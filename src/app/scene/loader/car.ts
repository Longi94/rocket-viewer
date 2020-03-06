import { PlayerData } from '../../model/replay/player-data';
import { ReplayScene } from '../replay-scene';
import { RocketManager } from './loader-config';
import { Body, createPaintConfig, Wheel } from 'rl-loadout-lib';
import { PlayerActor } from '../actor/player';
import { setEncoding } from '../../util/three';
import { LinearEncoding } from 'three';
import { RenderOrder } from '../../three/render-order';


export async function loadCar(playerData: PlayerData, rs: ReplayScene) {
  const teamPaint = playerData.team === 1 ? playerData.team_paint_orange : playerData.team_paint_blue;
  const paints = playerData.team === 1 ? playerData.paints.orange : playerData.paints.blue;
  const loadout = playerData.team === 1 ? playerData.loadouts.orange : playerData.loadouts.blue;

  const paintConfig = createPaintConfig(
    playerData.team === 1,
    teamPaint.primary_color,
    teamPaint.accent_color,
    paints.body,
    paints.decal,
    paints.wheels,
    paints.topper,
    paints.antenna
  );

  const bodyTask = RocketManager.loadBody(loadout.body, paintConfig, Body.DEFAULT);
  const wheelsTask = RocketManager.loadWheel(loadout.wheels, paintConfig, Wheel.DEFAULT);
  const body = await bodyTask;
  const wheels = await wheelsTask;
  body.setEnvMap(rs.envMap);
  wheels.setEnvMap(rs.envMap);

  setEncoding(body.scene, LinearEncoding);
  setEncoding(wheels.scene, LinearEncoding);

  body.addWheelsModel(wheels);

  body.scene.traverse(object => object.renderOrder = RenderOrder.OPAQUE);
  wheels.scene.traverse(object => object.renderOrder = RenderOrder.OPAQUE);

  rs.players[playerData.id] = new PlayerActor(playerData, body);
}
