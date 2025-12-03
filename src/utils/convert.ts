/** Float32 → Int16 PCM */
export function float32ToInt16PCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2); // 每个样本 2 字节
  const view = new DataView(buffer);

  for (let i = 0; i < float32Array.length; i++) {
    let sample = Math.max(-1, Math.min(1, float32Array[i])); // 限幅
    // Float32 [-1,1] -> Int16 [-32768,32767]
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(i * 2, int16, true); // 小端
  }

  return buffer;
}
/** 合并多个 ArrayBuffer */
export function mergeArrayBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return result.buffer;
}
// 将Base64编码的音频数据转换为ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64); // 解码 Base64 成 binary 字符串
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i); // 转成字节
  }

  return bytes.buffer; // 返回 ArrayBuffer
}
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary); // 转 base64
}
export function uint8ToBase64(bytes: Uint8Array | any) {
  let binary = "";
  const chunk = 0x8000; // 32KB
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
