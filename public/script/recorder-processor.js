class OpusRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.inputSampleRate = sampleRate; // 浏览器实际采样率（48k 或 44.1k）
    this.targetSampleRate = 16000;
    this.ratio = this.inputSampleRate / this.targetSampleRate;
    this.tempBuffer = []; // 接收 48k 数据
    this.targetFrameSize = 960; // 16k 下的 20ms = 960 采样点
    this.frameBuffer = new Float32Array(this.targetFrameSize);
    this.frameIndex = 0;
    this.isRecording = false;
    this.port.onmessage = e => {
      if (e.data.command === "start") this.isRecording = true;
      if (e.data.command === "stop") {
        this.isRecording = false;
        if (this.frameIndex > 0) {
          const finalBuf = this.frameBuffer.slice(0, this.frameIndex);
          this.port.postMessage({ buffer: finalBuf });
        }
      }
    };
  }

  process(inputs) {
    if (!this.isRecording) return true;
    const input = inputs[0][0];
    if (!input) return true;
    // 收集 48k 数据
    this.tempBuffer.push(...input);
    // 判断是否能输出重采样后的 16k 数据
    const availableOutputSamples = Math.floor(this.tempBuffer.length / this.ratio);
    if (availableOutputSamples > 0) {
      // 重采样
      const resampled = new Float32Array(availableOutputSamples);
      for (let i = 0; i < availableOutputSamples; i++) {
        resampled[i] = this.tempBuffer[Math.floor(i * this.ratio)];
      }
      // 移除已消费的数据
      const consumed = Math.floor(availableOutputSamples * this.ratio);
      this.tempBuffer = this.tempBuffer.slice(consumed);
      // 把 16k 的数据塞入固定 frame（960 samples）
      for (let i = 0; i < resampled.length; i++) {
        this.frameBuffer[this.frameIndex++] = resampled[i];
        if (this.frameIndex >= this.targetFrameSize) {
          // 输出 960 个 16k 采样数据
          this.port.postMessage({
            buffer: this.frameBuffer.slice(),
          });
          this.frameIndex = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("opus-recorder-processor", OpusRecorderProcessor);
