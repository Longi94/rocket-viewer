import { AdditiveBlending, DefaultLoadingManager, Sprite, SpriteMaterial, TextureLoader } from 'three';
import { PromiseLoader } from 'rl-loadout-lib';
import { ReplayScene } from '../replay-scene';

export async function loadBoostTexture(rs: ReplayScene) {
  const textureLoader = new PromiseLoader(new TextureLoader(DefaultLoadingManager));
  const texture = await textureLoader.load('/assets/sprites/dot.png');

  const material = new SpriteMaterial({
    map: texture,
    color: 0xff0000,
    blending: AdditiveBlending,
    fog: true
  });

  rs.boostSprite = new Sprite(material);
}
