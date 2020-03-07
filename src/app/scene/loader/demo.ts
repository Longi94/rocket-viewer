import { ReplayScene } from '../replay-scene';
import { textureLoader } from './loader-config';
import { SpriteSheetTexture } from '../../three/sprite-sheet-texture';

export async function loadDemoSprite(rs: ReplayScene) {
  const texture = await textureLoader.load('/assets/sprites/demo.png');
  texture.flipY = false;
  rs.demoTexture = new SpriteSheetTexture(texture, 5, 4, 1);
}
