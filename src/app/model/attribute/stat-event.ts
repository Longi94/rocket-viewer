import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export class StatEvent {
  unknown: boolean;
  objectId: number;

  static deserialize(br: BinaryReader): StatEvent {
    const s = new StatEvent();
    s.unknown = br.readBool();
    s.objectId = br.readInt32();
    return s;
  }
}

export const AttributeTypeStatEvent: AttributeType = {
  deserialize: (br: BinaryReader): StatEvent => {
    return StatEvent.deserialize(br);
  }
};
