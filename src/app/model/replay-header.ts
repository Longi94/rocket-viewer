import { BinaryReader } from '../parser/binary-reader';
import { Properties, Property } from './property';

export class ReplayHeader {
  length: number;
  crc: number;
  engineVersion: number;
  licenseeVersion: number;
  netVersion: number;
  game: string;
  properties: Properties;

  static deserialize(br: BinaryReader): ReplayHeader {
    const header = new ReplayHeader();
    header.length = br.readInt32();
    header.crc = br.readUInt32();

    header.engineVersion = br.readUInt32();
    header.licenseeVersion = br.readUInt32();

    if (header.engineVersion >= 868 && header.engineVersion >= 18) {
      header.netVersion = br.readUInt32();
    }

    header.game = br.readString();

    header.properties = Property.deserializeProperties(br);

    return header;
  }
}
