import { BinaryReader } from '../binary-reader';
import { Properties, Property } from './property';

export class ReplayVersion {
  engine: number;
  licensee: number;
  net: number = 0;

  ge(engine: number, licensee: number, net: number) {
    return this.engine >= engine && this.licensee >= licensee && this.net >= net;
  }
}

export class ReplayHeader {
  length: number;
  crc: number;
  version: ReplayVersion;
  game: string;
  properties: Properties;

  getProperty(name: string, _default?: any) {
    if (name in this.properties && this.properties[name] != undefined) {
      return this.properties[name].value != undefined ? this.properties[name].value : _default;
    } else {
      return _default;
    }
  }

  static deserialize(br: BinaryReader): ReplayHeader {
    const header = new ReplayHeader();
    header.length = br.readInt32();
    header.crc = br.readUInt32();

    header.version = new ReplayVersion();

    header.version.engine = br.readUInt32();
    header.version.licensee = br.readUInt32();

    if (header.version.engine >= 868 && header.version.licensee >= 18) {
      header.version.net = br.readUInt32();
    }

    header.game = br.readString();

    header.properties = Property.deserializeProperties(br);

    return header;
  }
}
