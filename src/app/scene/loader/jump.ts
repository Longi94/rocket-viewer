import { ReplayScene } from '../replay-scene';
import { textureLoader } from './loader-config';
import { AdditiveBlending, SpriteMaterial } from 'three';

export async function loadJumpSprite(rs: ReplayScene) {
  const texture = await textureLoader.load('/assets/sprites/jump.png');
  rs.jumpMaterial = new SpriteMaterial({map: texture, blending: AdditiveBlending, depthWrite: false, transparent: true});
}
