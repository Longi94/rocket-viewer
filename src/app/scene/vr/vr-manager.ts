import { EventDispatcher, Group, Object3D, WebGLRenderer } from 'three';
import { XRReferenceSpaceType, XRSession, XRSessionInit, XRSessionMode } from '../../util/vr';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { RingControl } from './ring-control';
import { PlayerData } from '../../model/replay/player-data';
import { CameraType } from '../camera/camera-type';

export enum VrManagerEvent {
  PLAYBACK_TOGGLE = 'playback-toggle',
  CAMERA_SELECT = 'camera-select',
  PLAYER_SELECT = 'player-select'
}

export class VrManager extends EventDispatcher {

  private vrSession: XRSession;
  inVr = false;

  onVrEnter: () => void;
  onVrLeave: () => void;

  private controllers: Group[] = [undefined, undefined];
  private controllerGrips: Group[] = [undefined, undefined];
  private controllerFactory = new XRControllerModelFactory();

  private cameraControl = new RingControl(['ball', 'player', 'fly']);
  private playerControl = new RingControl([]);

  private playerIds: number[] = [];

  // noinspection UnterminatedStatementJS
  vrEndListener = () => {
    this.inVr = false;
    this.vrSession.removeEventListener('end', this.vrEndListener);
    this.vrSession = undefined;
    this.vrUser.remove(...this.controllers);
    this.vrUser.remove(...this.controllerGrips);
    if (this.onVrLeave) {
      this.onVrLeave();
    }
  };

  // noinspection UnterminatedStatementJS
  selectStart = () => {
    this.dispatchEvent({type: VrManagerEvent.PLAYBACK_TOGGLE});
  };

  constructor(private readonly renderer: WebGLRenderer, private readonly vrUser: Object3D) {
    super();

    this.getController(0);
    this.getController(1);

    this.cameraControl.addToController(this.controllerGrips[0]);
    this.playerControl.addToController(this.controllerGrips[1]);

    this.cameraControl.addEventListener('select', event => {
      let cameraType = CameraType.VR_PLAYER_VIEW;
      switch (event.option) {
        case 0:
          cameraType = CameraType.VR_BALL;
          break;
        case 1:
          cameraType = CameraType.VR_PLAYER_VIEW;
          break;
        case 2:
          cameraType = CameraType.VR_FLY;
          break;
      }
      this.dispatchEvent({type: VrManagerEvent.CAMERA_SELECT, cameraType});
    });

    this.playerControl.addEventListener('select', event => {
      this.dispatchEvent({type: VrManagerEvent.PLAYER_SELECT, id: this.playerIds[event.option]});
    });
  }

  async enterVr() {
    if (this.vrSession == undefined) {
      const sessionInit: XRSessionInit = {optionalFeatures: [XRReferenceSpaceType.LOCAL_FLOOR, XRReferenceSpaceType.BOUNDED_FLOOR]};
      const session = await navigator.xr.requestSession(XRSessionMode.IMMERSIVE_VR, sessionInit);
      this.inVr = true;
      this.renderer.xr.setSession(session);
      this.vrSession = session;

      this.vrUser.add(...this.controllers);
      this.vrUser.add(...this.controllerGrips);

      session.addEventListener('end', this.vrEndListener);
      if (this.onVrEnter) {
        this.onVrEnter();
      }
    }
  }

  leaveVr() {
    this.vrSession?.end().then();
  }

  update() {
    if (!this.inVr) {
      return;
    }

    this.cameraControl.update();
    this.playerControl.update();
  }

  private getController(id: number) {
    const controller = this.renderer.xr.getController(id);

    controller.addEventListener('selectstart', this.selectStart);

    const controllerGrip = this.renderer.xr.getControllerGrip(id);
    controllerGrip.add(this.controllerFactory.createControllerModel(controllerGrip));

    this.controllers[id] = controller;
    this.controllerGrips[id] = controllerGrip;
  }

  setPlayers(players: PlayerData[]) {
    this.playerIds = players.map(p => p.id);
    this.playerControl.setOptions(players.map(p => p.name));
  }
}
