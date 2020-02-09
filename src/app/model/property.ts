import { BinaryReader } from '../parser/binary-reader';

export declare type Properties = { [name: string]: Property }

export enum PropertyType {
  ARRAY = 'ArrayProperty',
  INT = 'IntProperty',
  FLOAT = 'FloatProperty',
  STRING = 'StrProperty',
  NAME = 'NameProperty',
  BYTE = 'ByteProperty',
  BOOL = 'BoolProperty',
  QWORD = 'QWordProperty'
}

export class Property {

  name: string;
  type?: PropertyType;
  dataLength?: number;
  unknown?: number;
  value?: any;

  constructor(name?: string) {
    this.name = name;
  }

  deserializeValue(br: BinaryReader) {
    switch (this.type) {
      case PropertyType.INT:
        this.value = br.readInt32();
        break;
      case PropertyType.FLOAT:
        this.value = br.readFloat32();
        break;
      case PropertyType.STRING:
      case PropertyType.NAME:
        this.value = br.readString();
        break;
      case PropertyType.BYTE:
        this.value = {
          type: br.readString(),
          value: br.readString()
        };
        break;
      case PropertyType.BOOL:
        this.value = br.readByte() !== 0;
        break;
      case PropertyType.QWORD:
        this.value = br.readInt64();
        break;
      default:
        throw new Error(`Unknown property type: ${this.type}`);
    }
  }

  static deserializeProperties(br: BinaryReader): Properties {
    const props: Properties = {};
    let prop: Property;

    do {
      prop = Property.deserialize(br);
      props[prop.name] = prop;
    } while (prop.name !== 'None');

    return props;
  }

  static deserialize(br: BinaryReader): Property {
    const name = br.readString();

    if (name === 'None') {
      return new Property(name);
    }

    const type = br.readString() as PropertyType;

    let p: Property;
    if (type === PropertyType.ARRAY) {
      p = new ArrayProperty();
    } else {
      p = new Property();
    }

    p.name = name;
    p.type = type;
    p.dataLength = br.readInt32();
    p.unknown = br.readInt32();
    p.deserializeValue(br);

    return p;
  }
}

export class ArrayProperty extends Property {

  deserializeValue(br: BinaryReader) {
    if (this.type === PropertyType.ARRAY) {

      const properties: Properties[] = [];
      const len = br.readInt32();

      for (let i = 0; i < len; i++) {
        properties.push(Property.deserializeProperties(br));
      }

      this.value = properties;
    } else {
      throw new Error(`Unknown array property type: ${this.type}`);
    }
  }
}
