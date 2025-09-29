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
