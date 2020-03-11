declare global {
  interface Navigator {
    xr: any;
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
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      return supported ? VRSupport.SUPPORTED : VRSupport.VR_NOT_SUPPORTED;
    } else {
      return window.isSecureContext === false ? VRSupport.NEEDS_HTTPS : VRSupport.WEBXR_NOT_AVAILABLE;
    }
  }
};
