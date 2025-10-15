export const useRecording = () => {
  const isRecording = ref<boolean>(false);
  const audioContext = ref<AudioContext | null>(null);
  const mediaStream = ref<MediaStream | null>(null);
  const workletNode = ref<AudioWorkletNode | null>(null);
  const audioBufferData = ref<Float32Array[]>([]);
  const pcm_data = ref<string>("");
  const pcm_float = ref<Float32Array>(new Float32Array(0));

  const startRecording = async () => {
    try {
      audioContext.value = new AudioContext();
      mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sourceNode = audioContext.value.createMediaStreamSource(mediaStream.value);
      // 创建 ScriptProcessorNode（也可用 AudioWorklet 更先进）
      await audioContext.value.audioWorklet.addModule("/script/recording.js");
      workletNode.value = new AudioWorkletNode(audioContext.value, "recorder-processor");
      workletNode.value.port.onmessage = event => {
        audioBufferData.value.push(new Float32Array(event.data));
      };
      sourceNode.connect(workletNode.value);
      workletNode.value.connect(audioContext.value.destination);
      isRecording.value = true;
      // 3秒后自动停止
      setTimeout(() => {
        stopRecording();
      }, 3000);
    } catch (error) {
      console.error("录音失败:", error);
    }
  };
  const stopRecording = async () => {
    if (!isRecording.value) return;
    isRecording.value = false;
    workletNode.value?.disconnect();
    mediaStream.value?.getTracks().forEach(track => track.stop());
    audioContext.value?.close();
    // 合并pcm
    const totalLength = audioBufferData.value.reduce((acc, cur) => acc + cur.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of audioBufferData.value) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    pcm_float.value = merged;
    pcm_data.value = arrayBufferToBase64(floatTo16BitPCM(merged));
  };
  // float32 -> 16bit PCM
  const floatTo16BitPCM = (float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };
  const playPcm = () => {
    if (pcm_float.value.byteLength === 0) return;
    // 3. 用 Web Audio 播放 PCM 数据
    const audioCtx = new AudioContext();
    const buffer = audioCtx.createBuffer(1, pcm_float.value.length, audioCtx.sampleRate);
    buffer.copyToChannel(pcm_float.value, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  };
  // pcm 转 base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary); // 转 base64
  }

  return {
    playPcm,
    startRecording,
    isRecording,
    pcm_data,
  };
};
