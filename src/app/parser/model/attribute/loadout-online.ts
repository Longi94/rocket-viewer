import { AttributeType } from './attribute';
import { BinaryReader } from '../../binary-reader';
import { ProductAttribute } from './product-attribute';
import { ReplayVersion } from '../replay-header';

export class LoadoutOnline {
  attributes: ProductAttribute[][];

  static deserialize(br: BinaryReader, version: ReplayVersion, objectNames: string[]): LoadoutOnline {
    const l = new LoadoutOnline();
    l.attributes = [];

    const listCount = br.readByte();
    for (let i = 0; i < listCount; i++) {
      const attributes: ProductAttribute[] = [];
      const attributeCount = br.readByte();

      for (let j = 0; j < attributeCount; j++) {
        attributes.push(ProductAttribute.deserialize(br, version, objectNames));
      }

      l.attributes.push(attributes);
    }

    return l;
  }
}

export const AttributeTypeLoadoutOnline: AttributeType = {
  deserialize: (br: BinaryReader, version: ReplayVersion,
                objectNames: string[]): LoadoutOnline => {
    return LoadoutOnline.deserialize(br, version, objectNames);
  }
};
