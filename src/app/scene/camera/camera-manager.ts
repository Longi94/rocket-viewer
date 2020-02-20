import { Camera, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { CameraType } from './camera-type';
import { ReplayScene } from '../replay-scene';

export class CameraManager {

  private type = CameraType.PLAYER_VIEW;
  private target: Object3D;

  private pointingVector = new Vector3();
  private tempVector = new Vector3();

  constructor(private camera: PerspectiveCamera) {
  }

  setCamera(type: CameraType, target?: Object3D) {
    this.type = type;
    this.target = target;
  }

  getCamera(): Camera {
    return this.camera;
  }

  update(rs: ReplayScene) {
    if (this.type == CameraType.PLAYER_VIEW) {
      if (this.target == undefined) {
        return;
      }

      this.pointingVector.subVectors(rs.models.ball.position, this.camera.position)
        .normalize()
        .multiplyScalar(-280);

      this.tempVector.copy(this.target.position);
      this.tempVector.y += 100;
      this.tempVector.add(this.pointingVector);
      this.tempVector.y = Math.max(this.tempVector.y, 10);

      this.camera.position.lerp(this.tempVector, 0.9);
      this.camera.lookAt(rs.models.ball.position);
    }
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
