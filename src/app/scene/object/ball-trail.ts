import { Trail } from '../../three/trail-renderer';
import { Color, Object3D, Scene, ShaderMaterial, Vector3 } from 'three';
import { RenderOrder } from '../../three/render-order';
import { BallData } from '../../model/replay/ball-data';
import { advanceFrame } from '../../util/util';
import { WORLD_SCALE } from '../constant';

const COLOR_NEUTRAL = new Color('#ffffff');
const COLOR_ORANGE_HEAD = new Color('#f7a16a');
const COLOR_ORANGE_TAIL = new Color('#ff7000');
const COLOR_BLUE_HEAD = new Color('#87c7ff');
const COLOR_BLUE_TAIL = new Color('#0080ff');

export class BallTrail extends Trail {

  private readonly trailMaterial: ShaderMaterial;
  private currentFrame = 0;
  private currentTime = 0;

  constructor(scene: Scene, ball: Object3D, private readonly ballData: BallData) {
    super(scene);

    const trailHeadGeometry: Vector3[] = [];
    const scale = 30.0 * WORLD_SCALE;
    const inc = Math.PI * 2 / 16.0;

    for (let i = 0; i < 17; i++) {
      trailHeadGeometry.push(new Vector3(0, Math.cos(i * inc) * scale, Math.sin(i * inc) * scale));
    }

    this.trailMaterial = this.createMaterial();

    this.trailMaterial.uniforms.headColor.value.set(COLOR_NEUTRAL.r, COLOR_NEUTRAL.g, COLOR_NEUTRAL.b, 0.3);
    this.trailMaterial.uniforms.tailColor.value.set(COLOR_NEUTRAL.r, COLOR_NEUTRAL.g, COLOR_NEUTRAL.b, 0.0);

    this.initialize(this.trailMaterial, 100, 0, trailHeadGeometry, ball);
    this.mesh.renderOrder = RenderOrder.BALL_TRAIL;
    this.activate();
  }

  private updateColor() {
    switch (this.ballData.hit_team[this.currentFrame]) {
      case 0:
        this.trailMaterial.uniforms.headColor.value.set(COLOR_BLUE_HEAD.r, COLOR_BLUE_HEAD.g, COLOR_BLUE_HEAD.b, 0.3);
        this.trailMaterial.uniforms.tailColor.value.set(COLOR_BLUE_TAIL.r, COLOR_BLUE_TAIL.g, COLOR_BLUE_TAIL.b, 0.0);
        break;
      case 1:
        this.trailMaterial.uniforms.headColor.value.set(COLOR_ORANGE_HEAD.r, COLOR_ORANGE_HEAD.g, COLOR_ORANGE_HEAD.b, 0.3);
        this.trailMaterial.uniforms.tailColor.value.set(COLOR_ORANGE_TAIL.r, COLOR_ORANGE_TAIL.g, COLOR_ORANGE_TAIL.b, 0.0);
        break;
      default:
        this.trailMaterial.uniforms.headColor.value.set(COLOR_NEUTRAL.r, COLOR_NEUTRAL.g, COLOR_NEUTRAL.b, 0.3);
        this.trailMaterial.uniforms.tailColor.value.set(COLOR_NEUTRAL.r, COLOR_NEUTRAL.g, COLOR_NEUTRAL.b, 0.0);
        break;
    }
  }

  update(time: number, isUserInput: boolean) {
    this.currentFrame = advanceFrame(this.currentFrame, this.currentTime, time, this.ballData.hit_team_times);

    if (isUserInput) {
      this.reset();
    }
    this.updateColor();
    this.advance();
  }
}
