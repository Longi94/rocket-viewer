export enum XRSessionMode {
  IMMERSIVE_AR = 'immersive-ar',
  IMMERSIVE_VR = 'immersive-vr',
  INLINE = 'inline',
}

export enum XRReferenceSpaceType {
  LOCAL = 'local',
  BOUNDED_FLOOR = 'bounded-floor',
  LOCAL_FLOOR = 'local-floor',
  UNBOUNDED = 'unbounded',
  VIEWER = 'viewer',
}

export declare class XRSession extends EventTarget {
  end(): Promise<any>;
}

export declare class XRSessionInit {
  optionalFeatures?: XRReferenceSpaceType[];
  requiredFeatures?: XRReferenceSpaceType[];
}

declare class XRSystem {
  isSessionSupported(sessionMode: XRSessionMode): Promise<boolean>;

  requestSession(sessionMode: XRSessionMode, sessionInit: XRSessionInit): Promise<XRSession>;
}

declare global {
  interface Navigator {
    xr: XRSystem;
  }
}

export enum VRSupport {
  SUPPORTED,
  VR_NOT_SUPPORTED,
  WEBXR_NOT_AVAILABLE,
  NEEDS_HTTPS
}

export const VRUtils = {
  detect: async (): Promise<VRSupport> => {
    if ('xr' in navigator) {
      const supported = await navigator.xr.isSessionSupported(XRSessionMode.IMMERSIVE_VR);
      return supported ? VRSupport.SUPPORTED : VRSupport.VR_NOT_SUPPORTED;
    } else {
      return window.isSecureContext === false ? VRSupport.NEEDS_HTTPS : VRSupport.WEBXR_NOT_AVAILABLE;
    }
  }
};
