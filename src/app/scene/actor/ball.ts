import { BallData, BallType } from '../../model/replay/ball-data';
import { Color, Mesh, MeshStandardMaterial, Object3D, Scene } from 'three';
import { RigidBodyActor } from './rigid-body';
import { BallTrail } from '../object/ball-trail';

const EMISSIVE_ORANGE = new Color('#ffae00');
const EMISSIVE_BLUE = new Color('#00bfff');

export class BallActor extends RigidBodyActor {

  private readonly material: MeshStandardMaterial;
  private readonly trail: BallTrail;

  constructor(ballData: BallData, public readonly type: BallType, ball: Object3D, scene: Scene) {
    super(ball);
    this.material = (ball as Mesh).material as MeshStandardMaterial;
    this.trail = new BallTrail(scene, ball, ballData);
  }

  update(time: number, isUserInput: boolean = false) {
    this.trail.update(time, isUserInput);
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

  hide() {
    this.body.visible = false;
    this.trail.mesh.visible = false;
  }

  show() {
    this.body.visible = true;
    this.trail.mesh.visible = true;
  }

  dispose() {
    this.trail.dispose();
  }
}

function blendColor(base: number, blend: number, alpha: number): number {
  return (blend * alpha + base * (1.0 - alpha));
}
