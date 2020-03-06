import { Trail } from '../../three/trail-renderer';
import { Object3D, Scene, ShaderMaterial, Vector3 } from 'three';
import { RenderOrder } from '../../three/render-order';

export class BallTrail extends Trail {

  private readonly trailMaterial: ShaderMaterial;

  constructor(scene: Scene, ball: Object3D) {
    super(scene);

    const trailHeadGeometry: Vector3[] = [];
    const scale = 30.0;
    const inc = Math.PI * 2 / 16.0;

    for (let i = 0; i < 17; i++) {
      trailHeadGeometry.push(new Vector3(0, Math.cos(i * inc) * scale, Math.sin(i * inc) * scale));
    }

    this.trailMaterial = this.createMaterial();

    this.trailMaterial.uniforms.headColor.value.set(1.0, 0.0, 0.0, 0.5);
    this.trailMaterial.uniforms.tailColor.value.set(1.0, 0.0, 0.0, 0.5);

    this.initialize(this.trailMaterial, 100, 0, trailHeadGeometry, ball);
    this.mesh.renderOrder = RenderOrder.BALL_TRAIL;
    this.activate();
  }
}
