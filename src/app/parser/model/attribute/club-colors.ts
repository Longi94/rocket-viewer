import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';

export class ClubColors {
  blueFlag: boolean;
  blueColor: number;
  orangeFlag: boolean;
  orangeColor: number;

  static deserialize(br: BinaryReader): ClubColors {
    const c = new ClubColors();
    c.blueFlag = br.readBool();
    c.blueColor = br.readByte();
    c.orangeFlag = br.readBool();
    c.orangeColor = br.readByte();
    return c;
  }
}

export const AttributeTypeClubColors: AttributeType = {
  deserialize: (br: BinaryReader): ClubColors => {
    return ClubColors.deserialize(br);
  }
};
