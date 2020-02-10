export class BinaryReader {
  private readonly buffer: ArrayBuffer;
  private readonly view: DataView;

  private pos = 0;

  constructor(buffer) {
    this.buffer = buffer;
    this.view = new DataView(this.buffer);
  }

  readByte(): number {
    return this.buffer[this.pos++];
  }

  readBytes(l: number): Uint8Array {
    const bytes = new Uint8Array(this.buffer.slice(this.pos, this.pos + l));
    this.pos += l;
    return bytes;
  }

  readInt32(): number {
    const n = this.view.getInt32(this.pos, true);
    this.pos += 4;
    return n;
  }

  readUInt32(): number {
    const n = this.view.getUint32(this.pos, true);
    this.pos += 4;
    return n;
  }

  readString() {
    const length = this.readInt32();
    let str = '';

    if (length > 0) {
      str = String.fromCharCode.apply(null, new Uint8Array(this.buffer.slice(this.pos, this.pos + length - 1)));
      this.pos += length;
    } else if (length < 0) {
      const bytes = this.readBytes(length * -2);
      str = String.fromCharCode.apply(null, new Uint16Array(this.buffer.slice(this.pos, this.pos + (length * -2) - 2)));
    }

    return str;
  }

  readFloat32(): number {
    const n = this.view.getFloat32(this.pos, true);
    this.pos += 4;
    return n;
  }

  readInt64() {
    // @ts-ignore
    const n = this.view.getBigInt64(this.pos, true);
    this.pos += 8;
    return n;
  }

  skip(l: number) {
    this.pos += l;
  }

  skipString() {
    const length = this.readInt32();

    if (length > 0) {
      this.skip(length);
    } else if (length < 0) {
      this.skip(length * -2);
    }
  }
}
