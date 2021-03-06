import { ReplayScene } from '../replay-scene';
import { modelLoader, textureLoader } from './loader-config';
import { MeshStandardMaterial, Sprite, SpriteMaterial } from 'three';
import { traverseMaterials } from 'rl-loadout-lib/dist/3d/object';
import { RenderOrder } from '../../three/render-order';

export async function loadBoostPadModels(rs: ReplayScene) {
  const bigTask = modelLoader.load('/assets/models/boost_big.draco.glb');
  const smallTask = modelLoader.load('/assets/models/boost_small.draco.glb');
  const ballTask = textureLoader.load('/assets/sprites/boost_ball.png');

  const spriteMaterial = new SpriteMaterial({map: await ballTask});
  spriteMaterial.depthWrite = false;
  const boostSprite = new Sprite(spriteMaterial);
  boostSprite.position.y = 75;
  boostSprite.scale.setScalar(55);

  rs.models.bigBoostPad = (await bigTask).scene;
  rs.models.smallBoostPad = (await smallTask).scene;

  rs.models.bigBoostPad.renderOrder = RenderOrder.OPAQUE;
  rs.models.smallBoostPad.renderOrder = RenderOrder.OPAQUE;

  rs.models.bigBoostPad.getObjectByName('BoostPad_Large_Glow').add(boostSprite);

  traverseMaterials(rs.models.bigBoostPad, setDepthWrite);
}

function setDepthWrite(mat: MeshStandardMaterial) {
  if (mat.name === 'boost_glow') {
    mat.depthWrite = false;
  }
}
