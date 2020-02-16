import { PlayerData } from '../../model/replay/player-data';
import { ReplayScene } from '../replay-scene';
import { DEFAULT_PAINT_CONFIG_BLUE, DEFAULT_PAINT_CONFIG_ORANGE, modelLoader, RocketManager } from './loader-config';
import {
  Body,
  createBodyModel,
  createWheelsModel,
  Decal,
  MultiImageLoader,
  PromiseLoader,
  TextureFormat,
  Wheel
} from 'rl-loadout-lib';
import { DefaultLoadingManager } from 'three';
import { BodyAssets } from 'rl-loadout-lib/dist/loader/body/body-assets';
import { WheelAssets } from 'rl-loadout-lib/dist/loader/wheel/wheel-assets';
import { DecalAssets } from 'rl-loadout-lib/dist/loader/decal/decal-assets';


export async function loadCar(playerData: PlayerData, rs: ReplayScene) {
  const imageLoader = new PromiseLoader(new MultiImageLoader(TextureFormat.PNG, DefaultLoadingManager));

  const bodyModelTask = modelLoader.load('/assets/default/Body_Octane_SF.draco.glb');
  const bodyDTask = imageLoader.load('/assets/default/Pepe_Body_D.png');
  const bodyBlankTask = imageLoader.load('/assets/default/Pepe_Body_BlankSkin.png');
  const chassisD = imageLoader.load('/assets/default/Chasis_Pepe_D.png');
  const chassisN = imageLoader.load('/assets/default/Chasis_Pepe_N.png');

  const wheelModelTask = modelLoader.load('/assets/default/WHEEL_Star_SM.draco.glb');
  const oemDTask = imageLoader.load('/assets/default/OEM_D.png');
  const oemNTask = imageLoader.load('/assets/default/OEM_N.png');
  const oemRGBTask = imageLoader.load('/assets/default/OEM_RGB.png');
  const tireDTask = imageLoader.load('/assets/default/Tire_Swarm_Tyr_Diffuse.png');
  const tireNTask = imageLoader.load('/assets/default/Tire_Swarm_Tyr_Normal.png');

  const bodyAssets = new BodyAssets();
  bodyAssets.gltf = await bodyModelTask;
  bodyAssets.baseSkin = await bodyDTask;
  bodyAssets.blankSkin = await bodyBlankTask;
  bodyAssets.chassisD = await chassisD;
  bodyAssets.chassisN = await chassisN;

  const wheelAssets = new WheelAssets();
  wheelAssets.gltf = await wheelModelTask;
  wheelAssets.rimD = await oemDTask;
  wheelAssets.rimN = await oemNTask;
  wheelAssets.rimRgba = await oemRGBTask;
  wheelAssets.tireD = await tireDTask;
  wheelAssets.tireN = await tireNTask;

  const paintConfig = playerData.team === 0 ? DEFAULT_PAINT_CONFIG_BLUE : DEFAULT_PAINT_CONFIG_ORANGE;

  const body = createBodyModel(Body.DEFAULT, Decal.NONE, bodyAssets, new DecalAssets(), paintConfig);
  const wheels = createWheelsModel(Wheel.DEFAULT, wheelAssets, paintConfig);

  //const bodyTask = RocketManager.loadBody(Body.DEFAULT.id, DEFAULT_PAINT_CONFIG);
  //const wheelsTask = RocketManager.loadWheel(Wheel.DEFAULT.id, DEFAULT_PAINT_CONFIG);

  // const body = await bodyTask;
  //const wheels = await wheelsTask;
  body.setEnvMap(rs.envMap);
  wheels.setEnvMap(rs.envMap);
  body.addWheelsModel(wheels);

  rs.models.players[playerData.id] = body;
}
