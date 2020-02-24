import {
  Emitter,
  Life,
  Body,
  Radius,
  RadialVelocity,
  Vector3D,
  Alpha,
  Color,
  Scale,
  CrossZone,
  ScreenZone,
  Force,
  Rate
} from 'three-nebula';
import { Camera, Sprite, Vector3, WebGLRenderer } from 'three';

export class BoostEmitter {
  constructor(private readonly emitter: Emitter, sprite: Sprite, camera: Camera, renderer: WebGLRenderer) {
    this.emitter.setRate(new Rate(5, 0.01)).setInitializers([
      new Life(1),
      new Body(sprite),
      new Radius(50),
      new RadialVelocity(0, new Vector3D(0, 0, 0), 0)
    ]).setBehaviours([
      new Alpha(1, 0),
      new Color('#4f1500', '#ff972d'),
      new Scale(1, 0.5),
      new CrossZone(new ScreenZone(camera, renderer), 'dead'),
      new Force(0, 0, 0)
    ]).emit();
  }

  update(position: Vector3) {
    this.emitter.setPosition(position);
  }
}
