import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export class PrivateMatchSettings {
  mutators: string[];
  joinableBy: number;
  maxPlayers: number;
  gameName: string;
  password: string;
  flag: boolean;

  static deserialize(br: BinaryReader): PrivateMatchSettings {
    const p = new PrivateMatchSettings();
    p.mutators = br.readString().split(',');
    p.joinableBy = br.readUInt32();
    p.maxPlayers = br.readUInt32();
    p.gameName = br.readString();
    p.password = br.readString();
    p.flag = br.readBool();
    return p;
  }
}

export const AttributeTypePrivateMatchSettings: AttributeType = {
  deserialize: (br: BinaryReader): PrivateMatchSettings => {
    return PrivateMatchSettings.deserialize(br);
  }
};
