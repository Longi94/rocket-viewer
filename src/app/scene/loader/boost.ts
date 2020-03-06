import { AdditiveBlending, Sprite, SpriteMaterial } from 'three';
import { ReplayScene } from '../replay-scene';
import { textureLoader } from './loader-config';

export async function loadBoostTexture(rs: ReplayScene) {
  const texture = await textureLoader.load('/assets/sprites/dot.png');

  const material = new SpriteMaterial({
    map: texture,
    color: 0xff0000,
    blending: AdditiveBlending,
    fog: true,
    depthWrite: false
  });

  rs.boostSprite = new Sprite(material);
}
