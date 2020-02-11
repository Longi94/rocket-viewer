import { BinaryReader } from '../../parser/binary-reader';
import { ReplayVersion } from '../replay-header';

export class ProductAttribute {
  unknown: boolean;
  objectId: number;
  objectName: string;
  value: any;

  static deserialize(br: BinaryReader, version: ReplayVersion, objectNames: string[]): ProductAttribute {
    const p = new ProductAttribute();
    p.unknown = br.readBool();
    p.objectId = br.readUInt32();
    p.objectName = objectNames[p.objectId];

    switch (p.objectName) {
      case 'TAGame.ProductAttribute_UserColor_TA':
        if (version.greaterOrEquals(868, 23, 8)) {
          p.value = br.readUInt32();
        } else if (br.readBool()) {
          p.value = br.readUInt32FromBits(31);
        }
        break;
      case 'TAGame.ProductAttribute_Painted_TA':
        if (version.engine >= 868 && version.licensee >= 18) {
          p.value = br.readUInt32FromBits(31);
        } else {
          p.value = br.readUInt32Max(13);
        }
        break;
      case 'TAGame.ProductAttribute_TitleID_TA':
        p.value = br.readString();
        break;
      case 'TAGame.ProductAttribute_SpecialEdition_TA':
        p.value = br.readUInt32FromBits(31);
        break;
      case 'TAGame.ProductAttribute_TeamEdition_TA':
        if (version.engine >= 868 && version.licensee >= 18) {
          p.value = br.readUInt32FromBits(31);
        } else {
          p.value = br.readUInt32Max(13);
        }
        break;
    }

    return p;
  }
}
