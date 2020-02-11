import { AttributeType } from './attribute';
import { BinaryReader } from '../../parser/binary-reader';

export class TeamPaint {
  team: number;
  primaryColor: number;
  accentColor: number;
  primaryFinish: number;
  accentFinish: number;

  static deserialize(br: BinaryReader): TeamPaint {
    const t = new TeamPaint();
    t.team = br.readByte();
    t.primaryColor = br.readByte();
    t.accentColor = br.readByte();
    t.primaryFinish = br.readUInt32();
    t.accentFinish = br.readUInt32();
    return t;
  }
}

export const AttributeTypeTeamPaint: AttributeType = {
  deserialize: (br: BinaryReader): TeamPaint => {
    return TeamPaint.deserialize(br);
  }
};
