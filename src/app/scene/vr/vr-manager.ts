import { WebGLRenderer } from 'three';
import { XRReferenceSpaceType, XRSession, XRSessionInit, XRSessionMode } from '../../util/vr';

export class VrManager {

  vrSession: XRSession;
  inVr = false;

  onVrEnter: () => void;
  onVrLeave: () => void;

  // noinspection UnterminatedStatementJS
  vrEndListener = () => {
    this.inVr = false;
    this.vrSession.removeEventListener('end', this.vrEndListener);
    this.vrSession = undefined;
    if (this.onVrLeave) {
      this.onVrLeave();
    }
  }

  constructor(private readonly renderer: WebGLRenderer) {

  }

  async enterVr() {
    if (this.vrSession == undefined) {
      const sessionInit: XRSessionInit = {optionalFeatures: [XRReferenceSpaceType.LOCAL_FLOOR, XRReferenceSpaceType.BOUNDED_FLOOR]};
      const session = await navigator.xr.requestSession(XRSessionMode.IMMERSIVE_VR, sessionInit);
      this.inVr = true;
      this.renderer.xr.setSession(session);
      this.vrSession = session;
      session.addEventListener('end', this.vrEndListener);
      if (this.onVrEnter) {
        this.onVrEnter();
      }
    }
  }

  leaveVr() {
    this.vrSession?.end();
  }
}
