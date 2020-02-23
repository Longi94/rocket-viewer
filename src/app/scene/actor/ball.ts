import { BallType } from '../../model/replay/ball-data';
import { Color, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { RigidBodyActor } from './rigid-body';

const EMISSIVE_ORANGE = new Color('#ffae00');
const EMISSIVE_BLUE = new Color('#00bfff');

export class BallActor extends RigidBodyActor {

  private readonly emissive = new Color(1, 1, 1);
  private readonly material: MeshStandardMaterial;

  constructor(public readonly type: BallType, ball: Object3D) {
    super(ball);
    this.material = (ball as Mesh).material as MeshStandardMaterial;
  }

  update(time: number) {
    switch (this.type) {
      case BallType.PUCK:
      case BallType.UNKNOWN:
        return;
      case BallType.DEFAULT:
      case BallType.BASKETBALL:
      case BallType.CUBE:
        const posZ = this.body.position.z;
        this.emissive.set(posZ > 0.0 ? EMISSIVE_ORANGE : EMISSIVE_BLUE);

        const whiteAlpha = 1.0 - (Math.min(Math.abs(posZ), 1000.0) / 1000.0);
        this.emissive.r = blend(this.emissive.r, 1.0, whiteAlpha);
        this.emissive.g = blend(this.emissive.g, 1.0, whiteAlpha);
        this.emissive.b = blend(this.emissive.b, 1.0, whiteAlpha);

        this.material.emissive.set(this.emissive);
        break;
      case BallType.BREAKOUT:
        // TODO breakout ball
        return;
    }
  }
}

function blend(base: number, blend: number, alpha: number): number {
  return (blend * alpha + base * (1.0 - alpha));
}
