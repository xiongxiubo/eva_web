export const useCoreRecord = () => {
  // 录音相关变量
  let audioContext: AudioContext = new (window.AudioContext || window.webkitAudioContext)();
  let mediaStream: MediaStream | null = null;
  let mediaSource: MediaStreamAudioSourceNode | null = null;
  let audioProcessor: AudioWorkletNode | null = null;
  let bufferTimer: any = null;
  let sendBuffer: ArrayBuffer[] = [];

  const isRecording = ref(false);
  const mergedBuffer = ref<string>("");
  // 录音采集
  async function startRecording() {
    if (isRecording.value) return;
    try {
      audioContext = new AudioContext({ sampleRate: 16000 });
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await audioContext.audioWorklet.addModule("/script/recorder-processor.js");
      audioProcessor = new AudioWorkletNode(audioContext, "opus-recorder-processor");
      mediaSource = audioContext.createMediaStreamSource(mediaStream);
      mediaSource.connect(audioProcessor);

      audioProcessor.port.onmessage = e => {
        if (e.data.buffer) enqueueBuffer(float32ToInt16PCM(e.data.buffer));
      };
      // 启动录音
      audioProcessor.port.postMessage({ command: "start" });
      isRecording.value = true;
      bufferTimer = setInterval(flushBuffer, 100);
    } catch (error) {
      ElMessage.error("录音失败");
    }
  }
  const stopRecording = () => {
    isRecording.value = false;
    audioProcessor?.disconnect();
    mediaStream?.getTracks().forEach(t => t.stop());

    clearInterval(bufferTimer);
    flushBuffer();
  };
  const enqueueBuffer = (chunk: ArrayBuffer) => {
    sendBuffer.push(chunk);
    if (sendBuffer.length >= 5) flushBuffer();
  };
  const flushBuffer = () => {
    if (sendBuffer.length === 0) return;
    const merged = mergeArrayBuffers(sendBuffer);
    mergedBuffer.value = arrayBufferToBase64(merged);
    sendBuffer = [];
  };
  onUnmounted(() => {
    stopRecording();
  });
  return {
    isRecording,
    mergedBuffer,
    startRecording,
    stopRecording,
  };
};
