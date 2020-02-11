import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';
import { Rotation } from '../rotation';
import { ReplayVector } from '../replay-vector';
import { ReplayQuaternion } from '../replay-quaternion';
import { ReplayVersion } from '../replay-header';

export class RigidBodyState {
  sleeping: boolean;
  position: ReplayVector;
  rotation: Rotation | ReplayQuaternion;

  static deserialize(br: BinaryReader, version: ReplayVersion): RigidBodyState {
    const r = new RigidBodyState();

    r.sleeping = br.readBool();

    if (version.net >= 5) {

    } else {
      r.position = ReplayVector.deserialize(br, version.net);
    }
    if (version.net >= 7) {

    } else {
      r.position = ReplayVector.deserializeFixed(br);
    }
    return r;
  }
}


export const AttributeTypeRigidBodyState: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): RigidBodyState => {
    return RigidBodyState.deserialize(br, version);
  }
};
