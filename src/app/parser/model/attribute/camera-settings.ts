import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';
import { ReplayVersion } from '../replay-header';

export class CameraSettings {
  fov: number;
  height: number;
  pitch: number;
  distance: number;
  stiffness: number;
  swivelSpeed: number;
  transitionSpeed: number;

  static deserialize(br: BinaryReader, version: ReplayVersion): CameraSettings {
    const c = new CameraSettings();
    c.fov = br.readFloat32();
    c.height = br.readFloat32();
    c.pitch = br.readFloat32();
    c.distance = br.readFloat32();
    c.stiffness = br.readFloat32();
    c.swivelSpeed = br.readFloat32();
    if (version.engine >= 868 && version.licensee >= 20) {
      c.transitionSpeed = br.readFloat32();
    }
    return c;
  }
}

export const AttributeTypeCamSettings: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): CameraSettings => {
    return CameraSettings.deserialize(br, version);
  }
};
