import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';
import { ReplayVector } from '../replay-vector';
import { Rotation } from '../rotation';
import { ReplayVersion } from '../replay-header';

export class WeldedInfo {
  active: boolean;
  actorId: number;
  offset: ReplayVector;
  mass: number;
  rotation: Rotation;

  static deserialize(br: BinaryReader, version: ReplayVersion): WeldedInfo {
    const w = new WeldedInfo();
    w.active = br.readBool();
    w.actorId = br.readInt32();
    w.offset = ReplayVector.deserialize(br, version);
    w.mass = br.readFloat32();
    w.rotation = Rotation.deserialize(br);
    return w;
  }
}

export const AttributeTypeWeldedInfo: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): WeldedInfo => {
    return WeldedInfo.deserialize(br, version);
  }
};
