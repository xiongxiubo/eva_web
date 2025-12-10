export const useRecordAudio = () => {
  const audioContext = ref<AudioContext | null>(null);
  const mediaStream = ref<MediaStream | null>(null);
  const source = ref<MediaStreamAudioSourceNode | null>(null);

  const workletNode = ref<AudioWorkletNode | null>(null);

  const buffer = ref<Float32Array[]>([]);
  const isRecording = ref(false);
  const blob = ref<Blob>(); // 录音文件

  let recordStartTime: number | null = null; // 记录开始时间
  let autoStopTimer: number | null = null; // 自动停止 timer

  // 开始录音
  const startRecord = async () => {
    if (isRecording.value) return;
    isRecording.value = true;

    recordStartTime = Date.now(); // ⬅ 记录开始时间

    audioContext.value = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
    source.value = audioContext.value.createMediaStreamSource(mediaStream.value);

    await audioContext.value.audioWorklet.addModule("/script/recorder-processor.js");
    workletNode.value = new AudioWorkletNode(audioContext.value, "opus-recorder-processor");

    workletNode.value.port.onmessage = event => {
      // 接收 worklet 发送的数据
      console.log(event.data);
      buffer.value.push(new Float32Array(event.data.buffer));
    };
    workletNode.value.port.postMessage({ command: "start" });

    source.value.connect(workletNode.value);

    // 60s 后自动停止
    autoStopTimer = window.setTimeout(() => {
      stopRecord();
    }, 60000);
  };

  function stopRecord() {
    if (!isRecording.value) return ElMessage.error($at("recording.startError"));

    isRecording.value = false;

    // 清理自动停止 timer
    if (autoStopTimer) {
      clearTimeout(autoStopTimer);
      autoStopTimer = null;
    }

    // 停止音频
    workletNode.value?.disconnect();
    mediaStream.value?.getTracks().forEach(track => track.stop());
    audioContext.value?.close();

    // 计算录音时长
    const duration = recordStartTime ? (Date.now() - recordStartTime) / 1000 : 0;

    // ⛔ 小于 10 秒则不生成 wav
    if (duration < 10) {
      buffer.value = []; // 清除录音数据
      recordStartTime = null;
      return ElMessage.error($at("recording.durationError"));
    }
    blob.value = encodeWav16bit(buffer.value, 16000); // 保存录音文件
    ElMessage.success($at("录音成功"));
    // 下载录音文件
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob.value);
    a.download = "recording.wav";
    a.click();

    // 重置
    buffer.value = [];
    recordStartTime = null;
  }

  // -------------------- WAV 生成 ------------------------
  function encodeWav16bit(float32ArrList: any[], sampleRate: number) {
    let totalLength = float32ArrList.reduce((acc, arr) => acc + arr.length, 0);
    const floatData = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of float32ArrList) {
      floatData.set(chunk, offset);
      offset += chunk.length;
    }

    const buffer = new ArrayBuffer(44 + floatData.length * 2);
    const view = new DataView(buffer);

    write(view, 0, "RIFF");
    view.setUint32(4, 36 + floatData.length * 2, true);
    write(view, 8, "WAVE");
    write(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    write(view, 36, "data");
    view.setUint32(40, floatData.length * 2, true);

    let pos = 44;
    for (let i = 0; i < floatData.length; i++, pos += 2) {
      let s = Math.max(-1, Math.min(1, floatData[i]));
      view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([view], { type: "audio/wav" });
  }

  function write(view: DataView<ArrayBuffer>, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  return {
    startRecord,
    stopRecord,
    isRecording,
    blob,
  };
};
