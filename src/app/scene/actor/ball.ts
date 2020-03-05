import { BallType } from '../../model/replay/ball-data';
import { Color, Mesh, MeshStandardMaterial, Object3D, Scene, ShaderMaterial, Vector3 } from 'three';
import { RigidBodyActor } from './rigid-body';
import { Trail } from '../../three/trail-renderer';

const EMISSIVE_ORANGE = new Color('#ffae00');
const EMISSIVE_BLUE = new Color('#00bfff');

export class BallActor extends RigidBodyActor {

  private readonly material: MeshStandardMaterial;
  private readonly trail: Trail;
  private readonly trailMaterial: ShaderMaterial;

  constructor(public readonly type: BallType, ball: Object3D, scene: Scene) {
    super(ball);
    this.material = (ball as Mesh).material as MeshStandardMaterial;

    const trailHeadGeometry: Vector3[] = [];
    const scale = 30.0;
    const inc = Math.PI * 2 / 16.0;

    for (let i = 0; i < 17; i++) {
      trailHeadGeometry.push(new Vector3(Math.cos(i * inc) * scale, Math.sin(i * inc) * scale, 0));
    }

    this.trail = new Trail(scene);

    this.trailMaterial = this.trail.createMaterial();

    this.trailMaterial.uniforms.headColor.value.set(1.0, 0.0, 0.0, 0.5);
    this.trailMaterial.uniforms.tailColor.value.set(1.0, 0.0, 0.0, 0.5);

    this.trail.initialize(this.trailMaterial, 100, 0, trailHeadGeometry, ball);
    this.trail.activate();

    ball.visible = false;
  }

  update(time: number, isUserInput: boolean = false) {
    if (isUserInput) {
      this.trail.reset();
    }
    this.trail.advance();
    switch (this.type) {
      case BallType.PUCK:
      case BallType.UNKNOWN:
        return;
      case BallType.DEFAULT:
      case BallType.BASKETBALL:
      case BallType.CUBE:
        const posZ = this.body.position.z;
        this.material.emissive.set(posZ > 0.0 ? EMISSIVE_ORANGE : EMISSIVE_BLUE);
        const whiteAlpha = 1.0 - (Math.min(Math.abs(posZ), 1000.0) / 1000.0);
        this.material.emissive.r = blendColor(this.material.emissive.r, 1.0, whiteAlpha);
        this.material.emissive.g = blendColor(this.material.emissive.g, 1.0, whiteAlpha);
        this.material.emissive.b = blendColor(this.material.emissive.b, 1.0, whiteAlpha);
        break;
      case BallType.BREAKOUT:
        // TODO breakout ball
        return;
    }
  }
}

function blendColor(base: number, blend: number, alpha: number): number {
  return (blend * alpha + base * (1.0 - alpha));
}
