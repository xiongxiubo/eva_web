const sampleRate = 48000;
export async function playPCM(pcmBase64: string) {
  // 1. Base64 解码
  const binary = atob(pcmBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // 2. 转 int16 PCM → float32 [-1,1]
  const samples = new Float32Array(bytes.length / 2);
  for (let i = 0; i < samples.length; i++) {
    const low = bytes[2 * i];
    const high = bytes[2 * i + 1];
    let val = (high << 8) | low;
    if (val >= 0x8000) val = val - 0x10000; // 处理负数
    samples[i] = val / 32768;
  }

  // 3. 用 Web Audio 播放
  const audioCtx = new AudioContext({ sampleRate: 48000 });
  const buffer = audioCtx.createBuffer(1, samples.length, 48000);
  buffer.copyToChannel(samples, 0);

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
}

export async function DownloadPCM(pcmBase64: string) {
  // 1. Base64 解码
  const binary = atob(pcmBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // 2. int16 PCM → float32 [-1, 1]
  const samples = new Float32Array(bytes.length / 2);
  for (let i = 0; i < samples.length; i++) {
    const low = bytes[2 * i];
    const high = bytes[2 * i + 1];
    let val = (high << 8) | low;
    if (val >= 0x8000) val = val - 0x10000;
    samples[i] = val / 32768;
  }

  // 4. 生成 WAV 文件 Blob
  const wavBuffer = encodeWAV(samples, sampleRate);
  const blob = new Blob([wavBuffer], { type: "audio/wav" });

  // 5. 触发下载
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "audio.wav";
  a.click();
  URL.revokeObjectURL(url);
}

// 将 Float32 PCM 转成 WAV Buffer
function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // 写 WAV 头
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // PCM 数据
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
