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
import { advanceFrame } from '../../util/util';

export class BoostEmitter {

  private active = false;
  private currentFrame = 0;
  private currentTime = 0;

  constructor(
    private readonly emitter: Emitter,
    sprite: Sprite,
    camera: Camera,
    renderer: WebGLRenderer,
    private readonly activeFrames: boolean[],
    private readonly times: number[],
    team: number
  ) {
    const color = team === 1 ? new Color('#4f1500', '#ff972d') :
      new Color('#00224f', '#65d4ff');
    this.emitter.setRate(new Rate(5, 0.01)).setInitializers([
      new Life(1),
      new Body(sprite),
      new Radius(50),
      new RadialVelocity(0, new Vector3D(0, 0, 0), 0)
    ]).setBehaviours([
      new Alpha(1, 0),
      color,
      new Scale(1, 0.5),
      new CrossZone(new ScreenZone(camera, renderer), 'dead'),
      new Force(0, 0, 0)
    ]);
  }

  update(time: number, position: Vector3, isUserInput: boolean) {
    this.emitter.setPosition(position);

    this.currentFrame = advanceFrame(this.currentFrame, this.currentTime, time, this.times);

    if (isUserInput) {
      this.emitter.removeAllParticles();
      this.emitter.stopEmit();
      this.active = false;
      this.currentTime = time;
      return;
    }

    if (this.active === this.activeFrames[this.currentFrame]) {
      return;
    }

    if (this.activeFrames[this.currentFrame]) {
      if (!this.active) {
        this.emitter.emit();
      }
    } else {
      if (this.active) {
        this.emitter.stopEmit();
      }
    }

    this.active = this.activeFrames[this.currentFrame];
    this.currentTime = time;
  }
}
