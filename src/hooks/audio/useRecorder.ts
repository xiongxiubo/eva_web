// 伪代码：专注录音采集与回调
export function useRecorder(onBuffer: (buf: ArrayBuffer) => void) {
  const isRecording = ref(false);
  let audioCtx: AudioContext | null = null;
  let workletNode: AudioWorkletNode | null = null;

  const start = async () => {
    audioCtx = new AudioContext({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    await audioCtx.audioWorklet.addModule("/script/recorder-processor.js");

    workletNode = new AudioWorkletNode(audioCtx, "opus-recorder-processor");
    workletNode.port.onmessage = e => onBuffer(e.data.buffer);

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(workletNode);
    isRecording.value = true;
  };

  const stop = () => {
    workletNode?.port.postMessage({ command: "stop" });
    audioCtx?.close();
    isRecording.value = false;
  };

  return { isRecording, start, stop };
}
