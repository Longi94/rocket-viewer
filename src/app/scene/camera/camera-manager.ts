import { Camera, Object3D, PerspectiveCamera, Scene, Vector3 } from 'three';
import { CameraType } from './camera-type';
import { ReplayScene } from '../replay-scene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PlayerActor } from '../actor/player';

export class CameraManager {

  private type = CameraType.PLAYER_VIEW;
  private target: PlayerActor;

  private pointingVector = new Vector3();
  private tempVector = new Vector3();

  private lastTime: number;
  private orbitControls: OrbitControls;

  private vrCameraContainer = new Object3D();
  private carCameraPos = new Object3D();

  onMove: () => void;

  constructor(scene: Scene, private camera: PerspectiveCamera, canvasDiv: HTMLCanvasElement) {
    this.orbitControls = new OrbitControls(this.camera, canvasDiv);
    this.orbitControls.enabled = false;
    this.orbitControls.addEventListener('change', () => {
      this.onMove();
    });
    scene.add(this.vrCameraContainer);
    this.carCameraPos.position.set(40, 30, 0);
    this.vrCameraContainer.add(this.carCameraPos);
  }

  setCamera(type: CameraType, target?: PlayerActor) {
    this.type = type;

    if (this.target != undefined) {
      this.target.nameplateVisible(true);
    }
    if (target != undefined) {
      target.nameplateVisible(false);
    }
    this.target = target;

    this.orbitControls.enabled = false;
    this.carCameraPos.remove(this.camera);
    switch (type) {
      case CameraType.ORBITAL:
        this.orbitControls.enabled = true;
        break;
      case CameraType.VR_PLAYER_VIEW:
        this.carCameraPos.add(this.camera);
        break;
    }

    this.onMove();
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

        this.pointingVector.subVectors(rs.ballActor.getPosition(), this.camera.position)
          .normalize()
          .multiplyScalar(-280);

        this.tempVector.copy(this.target.body.position);
        this.tempVector.y += 100;
        this.tempVector.add(this.pointingVector);
        this.tempVector.y = Math.max(this.tempVector.y, 10);

        this.camera.position.copy(this.tempVector);
        this.camera.lookAt(rs.ballActor.getPosition());
        break;
      case CameraType.ORBITAL:
        this.orbitControls.update();
        break;
      case CameraType.VR_PLAYER_VIEW:
        this.tempVector.copy(this.target.body.position);
        this.vrCameraContainer.position.copy(this.target.body.position);
        this.vrCameraContainer.quaternion.copy(this.target.car.quaternion);
        break;
    }

    this.lastTime = time;
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
