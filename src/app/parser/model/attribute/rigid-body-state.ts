import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';
import { ReplayVector } from '../replay-vector';
import { ReplayQuaternion } from '../replay-quaternion';
import { ReplayVersion } from '../replay-header';

export class RigidBodyState {
  sleeping: boolean;
  position: ReplayVector;
  rotation: ReplayQuaternion;
  linearVelocity: ReplayVector;
  angularVelocity: ReplayVector;

  static deserialize(br: BinaryReader, version: ReplayVersion): RigidBodyState {
    const r = new RigidBodyState();

    r.sleeping = br.readBool();
    r.position = ReplayVector.deserialize(br, version);
    if (version.net >= 5) {
      r.position.x /= 100;
      r.position.y /= 100;
      r.position.z /= 100;
    }

    r.rotation = ReplayQuaternion.deserialize(br, version);

    if (!r.sleeping) {
      r.linearVelocity = ReplayVector.deserialize(br, version);
      r.angularVelocity = ReplayVector.deserialize(br, version);
    }

    return r;
  }
}


export const AttributeTypeRigidBodyState: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion): RigidBodyState => {
    return RigidBodyState.deserialize(br, version);
  }
};
