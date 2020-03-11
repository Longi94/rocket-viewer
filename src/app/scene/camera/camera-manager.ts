import { Camera, EventDispatcher, Object3D, PerspectiveCamera, Scene, Vector3 } from 'three';
import { CameraType } from './camera-type';
import { ReplayScene } from '../replay-scene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PlayerActor } from '../actor/player';
import { WORLD_SCALE } from '../constant';

export class CameraManager extends EventDispatcher {

  type = CameraType.PLAYER_VIEW;
  private target: PlayerActor;

  private pointingVector = new Vector3();
  private tempVector = new Vector3();
  private tempVector2 = new Vector3();

  private lastTime: number;
  private orbitControls: OrbitControls;

  private vrTarget = new Object3D();
  vrUser = new Object3D();

  constructor(private readonly rootScene: Scene, private camera: PerspectiveCamera, canvasDiv: HTMLCanvasElement) {
    super();
    this.orbitControls = new OrbitControls(this.camera, canvasDiv);
    this.orbitControls.enabled = false;
    this.orbitControls.addEventListener('change', () => this.dispatchEvent({type: 'move'}));
    rootScene.add(this.vrTarget);
    this.vrTarget.add(this.vrUser);
  }

  setTarget(target: PlayerActor) {
    if (this.target !== target) {
      this.target?.nameplateVisible(true);
      target?.nameplateVisible(false);
      this.target = target;

      if (this.type == CameraType.VR_PLAYER_VIEW) {
        this.target.car.add(this.vrTarget);
      }
      this.dispatchEvent({type: 'move'});
    }
  }

  setCamera(rs: ReplayScene, type: CameraType) {
    if (this.type !== type) {
      this.type = type;

      // reset stuff
      rs.ballActor.show();
      this.orbitControls.enabled = false;
      this.vrUser.position.set(0, 0, 0);
      this.vrTarget.position.set(0, 0, 0);
      this.vrUser.remove(this.camera);
      this.rootScene.add(this.vrTarget);

      switch (type) {
        case CameraType.ORBITAL:
          this.orbitControls.enabled = true;
          break;
        case CameraType.VR_PLAYER_VIEW:
          this.vrUser.position.set(40, 35, 0);
          this.vrUser.add(this.camera);
          this.target.car.add(this.vrTarget);
          break;
        case CameraType.VR_BALL:
          this.vrUser.add(this.camera);
          rs.ballActor.hide();
          break;
        case CameraType.VR_FLY:
          this.vrUser.add(this.camera);
          this.vrTarget.position.set(0, 1000, 0);
          break;
      }

      this.dispatchEvent({type: 'move'});
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

        this.pointingVector.subVectors(rs.ballActor.getPosition(), this.target.body.position)
          .normalize()
          .multiplyScalar(-280);

        this.tempVector.copy(this.target.body.position);
        this.tempVector.y += 100;
        this.tempVector.add(this.pointingVector);
        this.tempVector.y = Math.max(this.tempVector.y, 10);
        this.tempVector.multiplyScalar(WORLD_SCALE);

        this.tempVector2.copy(rs.ballActor.getPosition());
        this.tempVector2.multiplyScalar(WORLD_SCALE);

        this.camera.position.copy(this.tempVector);
        this.camera.lookAt(this.tempVector2);
        break;
      case CameraType.ORBITAL:
        this.orbitControls.update();
        break;
      case CameraType.VR_BALL:
        this.vrTarget.position.set(0, 0, 0);
        rs.ballActor.body.localToWorld(this.vrTarget.position);
        rs.ballActor.hide();
        break;
    }

    this.lastTime = time;
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
