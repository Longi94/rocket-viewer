export class BinaryReader {
  private readonly buffer: Uint8Array;
  private readonly view: DataView;

  bitPos = 0;

  constructor(buffer: ArrayBuffer) {
    this.buffer = new Uint8Array(buffer);
    this.view = new DataView(buffer);
  }

  readBit(): number {
    const a = new Uint8Array(1);
    this.readBits(a, 1);
    return a[0];
  }

  readBool(): boolean {
    return this.readBit() !== 0;
  }

  private readBits(buffer: ArrayBufferLike, bits: number, offset: number = 0) {
    for (let i = 0; i < bits; i++) {
      buffer[offset] |= ((this.buffer[Math.floor(this.bitPos / 8)] >> (this.bitPos % 8)) & 1) << i;
      this.bitPos++;
    }
  }

  readInt32(): number {
    if (this.bitPos % 8 === 0) {
      const n = this.view.getInt32(this.bitPos / 8, true);
      this.bitPos += 32;
      return n;
    } else {
      const a = new Int32Array(1);
      this.readBits(a, 32);
      return a[0];
    }
  }

  readUInt32(): number {
    if (this.bitPos % 8 === 0) {
      const n = this.view.getUint32(this.bitPos / 8, true);
      this.bitPos += 32;
      return n;
    } else {
      const a = new Uint32Array(1);
      this.readBits(a, 32);
      return a[0];
    }
  }

  readInt64(): bigint {
    if (this.bitPos % 8 === 0) {
      // @ts-ignore
      const n = this.view.getBigInt64(this.bitPos / 8, true);
      this.bitPos += 64;
      return n;
    } else {
      const a = new Int32Array(2);
      this.readBits(a, 32, 0);
      this.readBits(a, 32, 1);
      // @ts-ignore
      return new DataView(a.buffer).getBigInt64(0, true);
    }
  }

  readUInt64(): bigint {
    if (this.bitPos % 8 === 0) {
      // @ts-ignore
      const n = this.view.getBigUint64(this.bitPos / 8, true);
      this.bitPos += 64;
      return n;
    } else {
      const a = new Uint32Array(2);
      this.readBits(a, 32, 0);
      this.readBits(a, 32, 1);
      // @ts-ignore
      return new DataView(a.buffer).getBigUint64(0, true);
    }
  }

  readFloat32(): number {
    if (this.bitPos % 8 === 0) {
      const n = this.view.getFloat32(this.bitPos / 8, true);
      this.bitPos += 32;
      return n;
    } else {
      const a = new Int32Array(4);
      for (let i = 0; i < 4; i++) {
        this.readBits(a, 8, i);
      }
      // @ts-ignore
      return new DataView(a.buffer).getFloat32(0, true);
    }
  }

  readByte(): number {
    if (this.bitPos % 8 === 0) {
      const n = this.buffer[this.bitPos / 8];
      this.bitPos += 8;
      return n;
    } else {
      const a = new Uint8Array([0]);
      this.readBits(a, 8);
      return a[0];
    }
  }

  readBytes(l: number): Uint8Array {
    if (this.bitPos % 8 === 0) {
      const bytes = new Uint8Array(this.buffer.slice(this.bitPos / 8, this.bitPos / 8 + l));
      this.bitPos += l * 8;
      return bytes;
    } else {
      const a = new Uint8Array(l);
      for (let i = 0; i < l; i++) {
        this.readBits(a, 8, i);
      }
      return a;
    }
  }

  readString() {
    const length = this.readInt32();
    let str = '';

    if (length > 0) {
      const bytes = this.readBytes(length);
      str = String.fromCharCode.apply(null, bytes.slice(0, length - 1));
    } else if (length < 0) {
      const bytes = this.readBytes(length * -2);
      str = String.fromCharCode.apply(null, bytes.slice(0, (length * -2) - 2));
    }

    return str;
  }

  readStringList(): string[] {
    const l = this.readInt32();
    const strs: string[] = [];

    for (let i = 0; i < l; i++) {
      strs.push(this.readString());
    }
    return strs;
  }

  readDeserializableList<T>(clazz): T[] {
    const l = this.readInt32();
    const objects = [];

    for (let i = 0; i < l; i++) {
      objects.push(clazz.deserialize(this));
    }
    return objects;
  }


  skipBits(l: number) {
    this.bitPos += l;
  }

  skipBytes(l: number) {
    this.skipBits(l * 8);
  }

  skipString() {
    const length = this.readInt32();

    if (length > 0) {
      this.skipBytes(length);
    } else if (length < 0) {
      this.skipBytes(length * -2);
    }
  }

  length(): number {
    return this.buffer.length;
  }

  readUInt32Max(maxVal: number) {
    const maxBits = Math.floor(Math.log10(maxVal) / Math.log10(2)) + 1;

    let a = new Uint32Array(1);

    for (let i = 0; i < maxBits && (a[0] + (1 << i)) < maxVal; i++) {
      a[0] |= ((this.buffer[Math.floor(this.bitPos / 8)] >> (this.bitPos % 8)) & 1) << i;
      this.bitPos++;
    }

    if (a[0] > maxVal) {
      throw new Error('ReadUInt32Max overflowed!');
    }

    return a[0];
  }

  readUInt32FromBits(l: number): number {
    const a = new Uint32Array(1);
    this.readBits(a, l);
    return a[0];
  }

  readInt32FromBits(l: number): number {
    const a = new Int32Array(1);
    this.readBits(a, l);
    return a[0];
  }

  readFixedCompressedFloat(max: number, l: number) {
    let value = 0.0;
    // NumBits = 8:
    const maxBitValue = (1 << (l - 1)) - 1; //   0111 1111 - Max abs value we will serialize
    const bias = (1 << (l - 1));    //   1000 0000 - Bias to pivot around (in order to support signed values)
    const serIntMax = (1 << l);   // 1 0000 0000 - What we pass into SerializeInt

    const delta = this.readUInt32Max(serIntMax);
    const unscaledValue = delta - bias;

    if (max > maxBitValue) {
      // We have to scale down, scale needs to be a float:
      const invScale = max / maxBitValue;
      value = unscaledValue * invScale;
    } else {
      const scale = maxBitValue / max;
      const invScale = 1.0 / scale;

      value = unscaledValue * invScale;
    }

    return value;
  }
}
