import { EventDispatcher, Group, Object3D, WebGLRenderer } from 'three';
import { XRReferenceSpaceType, XRSession, XRSessionInit, XRSessionMode } from '../../util/vr';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';

export enum VrManagerEvent {
  PLAYBACK_TOGGLE = 'playback-toggle'
}

export class VrManager extends EventDispatcher {

  private vrSession: XRSession;
  inVr = false;

  onVrEnter: () => void;
  onVrLeave: () => void;

  private controllers: Group[] = [undefined, undefined];
  private controllerGrips: Group[] = [undefined, undefined];
  private controllerFactory = new XRControllerModelFactory();

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

  private getController(id: number) {
    const controller = this.renderer.xr.getController(id);

    controller.addEventListener('selectstart', this.selectStart);

    const controllerGrip = this.renderer.xr.getControllerGrip(id);
    controllerGrip.add(this.controllerFactory.createControllerModel(controllerGrip));

    this.controllers[id] = controller;
    this.controllerGrips[id] = controllerGrip;
  }
}
