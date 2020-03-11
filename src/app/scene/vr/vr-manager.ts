import { WebGLRenderer } from 'three';

export class VrManager {

  vrSession: any;
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
      const sessionInit = {optionalFeatures: ['local-floor', 'bounded-floor']};
      const session = await navigator.xr.requestSession('immersive-vr', sessionInit);
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
