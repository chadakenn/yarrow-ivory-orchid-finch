const CRC_TABLE = new Uint32Array(256);

for (let i = 0; i < 256; i += 1) {
  let crc = i;
  for (let j = 0; j < 8; j += 1) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  CRC_TABLE[i] = crc >>> 0;
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number) {
  const out = new Uint8Array(2);
  new DataView(out.buffer).setUint16(0, value, true);
  return out;
}

function u32(value: number) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value, true);
  return out;
}

function concat(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function encodeName(name: string) {
  return new TextEncoder().encode(name.replaceAll("\\", "/").replace(/^\/+/, ""));
}

export function createZip(files: Record<string, Uint8Array>) {
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const [rawName, data] of Object.entries(files)) {
    const name = encodeName(rawName);
    if (!name.length) continue;
    const crc = crc32(data);
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ]);
    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const center = concat(centrals);
  const count = centrals.length;
  const end = concat([u32(0x06054b50), u16(0), u16(0), u16(count), u16(count), u32(center.length), u32(offset), u16(0)]);
  return concat([...locals, center, end]);
}

export function readZip(buf: Uint8Array) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const files: Record<string, Uint8Array> = {};
  let i = 0;
  while (i + 30 <= buf.length) {
    const sig = view.getUint32(i, true);
    if (sig === 0x02014b50 || sig === 0x06054b50) break;
    if (sig !== 0x04034b50) throw new Error("not a mill pack");
    const method = view.getUint16(i + 8, true);
    const nameLen = view.getUint16(i + 26, true);
    const extraLen = view.getUint16(i + 28, true);
    const compact = view.getUint32(i + 18, true);
    const raw = view.getUint32(i + 22, true);
    const nameStart = i + 30;
    const name = new TextDecoder().decode(buf.subarray(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    const data = buf.subarray(dataStart, dataStart + compact);
    if (method !== 0) throw new Error("mill pack is compressed in a way this TV cannot read");
    if (name && !name.endsWith("/")) files[name.replaceAll("\\", "/")] = data.slice(0, raw);
    i = dataStart + compact;
  }
  return files;
}
