import { Camera, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { CameraType } from './camera-type';
import { ReplayScene } from '../replay-scene';

export class CameraManager {

  private type = CameraType.PLAYER_VIEW;
  private target: Object3D;

  private pointingVector = new Vector3();

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
      this.camera.lookAt(rs.models.ball.position);
      this.camera.position.copy(this.target.position);
      this.camera.position.y += 100;

      this.pointingVector.subVectors(rs.models.ball.position, this.camera.position)
        .normalize()
        .multiplyScalar(-280);

      this.camera.position.add(this.pointingVector);

      this.camera.position.y = Math.max(this.camera.position.y, 10);
    }
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
