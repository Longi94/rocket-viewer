import { RepeatWrapping, Texture } from 'three';

export class SpriteSheetTexture {

  private readonly spriteWidth: number;
  private readonly spriteHeight: number;
  private readonly spriteCount: number;
  public readonly texture: Texture;

  time = 0;

  constructor(texture: Texture,
              public readonly columns: number,
              public readonly rows: number,
              public readonly length: number) {
    this.texture = texture.clone();
    this.texture.wrapS = this.texture.wrapT = RepeatWrapping;
    this.texture.needsUpdate = true;
    this.texture.repeat.set(1.0 / columns, 1.0 / rows);
    this.spriteWidth = texture.image.width / columns;
    this.spriteHeight = texture.image.height / rows;
    this.spriteCount = rows * columns;
  }

  update() {
    this.updateTime(this.time);
  }

  updateTime(time: number) {
    const tile = Math.floor((time % this.length) / this.length * this.spriteCount);
    this.texture.offset.x = (tile % this.columns) / this.columns;
    this.texture.offset.y = Math.floor(tile / this.columns) / this.rows;
  }

  clone(): SpriteSheetTexture {
    return new SpriteSheetTexture(this.texture, this.columns, this.rows, this.length);
  }

  dispose() {
    this.texture.dispose();
  }
}
