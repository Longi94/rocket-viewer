import { createOffscreenCanvas } from 'rl-loadout-lib/dist/utils/offscreen-canvas';
import { DataTexture, LinearFilter, Sprite, SpriteMaterial } from 'three';
import { roundRect } from '../../util/canvas';

const WIDTH = 2048;
const HEIGHT = 2048;

const NAMEPLATE_HEIGHT = 100;
const NAMEPLATE_MIN_HEIGHT = 450;

const COLOR_BLUE = '#206DFF';
const COLOR_ORANGE = '#F98522';

export class Nameplate {
  readonly sprite: Sprite;

  constructor(name: string, team: number) {
    name = name.toUpperCase();

    const canvas = createOffscreenCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${Math.floor(NAMEPLATE_HEIGHT * 9 / 10)}px Roboto`;
    ctx.fillStyle = team == 0 ? COLOR_BLUE : COLOR_ORANGE;

    const textWidth = ctx.measureText(name).width;
    const plateWidth = Math.min(WIDTH, Math.max(NAMEPLATE_MIN_HEIGHT, textWidth + NAMEPLATE_HEIGHT));

    roundRect(ctx, WIDTH / 2 - plateWidth / 2, HEIGHT / 2 - NAMEPLATE_HEIGHT, plateWidth, NAMEPLATE_HEIGHT, NAMEPLATE_HEIGHT / 2, true);

    ctx.fillStyle = 'white';
    ctx.fillText(name.toUpperCase(), WIDTH / 2, HEIGHT / 2 - Math.floor(NAMEPLATE_HEIGHT * 2 / 10), WIDTH - NAMEPLATE_HEIGHT);

    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const texture = new DataTexture(imageData.data, WIDTH, HEIGHT);
    texture.flipY = true;
    texture.magFilter = LinearFilter;
    const spriteMaterial = new SpriteMaterial({map: texture});
    this.sprite = new Sprite(spriteMaterial);
    this.sprite.scale.setScalar(1000);
    this.sprite.position.y = 100;
  }
}
