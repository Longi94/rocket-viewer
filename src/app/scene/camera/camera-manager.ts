import { Camera, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { CameraType } from './camera-type';
import { ReplayScene } from '../replay-scene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class CameraManager {

  private type = CameraType.PLAYER_VIEW;
  private target: Object3D;

  private pointingVector = new Vector3();
  private tempVector = new Vector3();

  private lastTime: number;
  private orbitControls: OrbitControls;

  constructor(private camera: PerspectiveCamera, canvasDiv: HTMLCanvasElement) {
    this.orbitControls = new OrbitControls(this.camera, canvasDiv);
    this.orbitControls.enabled = false;
  }

  setCamera(type: CameraType, target?: Object3D) {
    this.type = type;
    this.target = target;

    this.orbitControls.enabled = false;
    switch (type) {
      case CameraType.ORBITAL:
        this.orbitControls.enabled = true;
        break;
    }
  }

  getCamera(): Camera {
    return this.camera;
  }

  update(time: number, rs: ReplayScene) {
    switch (this.type) {
      case CameraType.PLAYER_VIEW:
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

        this.camera.position.copy(this.tempVector);
        this.camera.lookAt(rs.models.ball.position);
        break;
      case CameraType.ORBITAL:
        this.orbitControls.update();
        break;
    }

    this.lastTime = time;
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
