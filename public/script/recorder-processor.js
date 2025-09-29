class OpusRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffers = [];
    this.frameSize = 960;
    this.buffer = new Float32Array(this.frameSize);
    this.bufferIndex = 0;
    this.isRecording = false;

    this.port.onmessage = event => {
      if (event.data.command === "start") {
        this.isRecording = true;
      } else if (event.data.command === "stop") {
        this.isRecording = false;
        // 发送最后的缓冲区
        if (this.bufferIndex > 0) {
          const finalBuffer = this.buffer.slice(0, this.bufferIndex);
          this.port.postMessage({ buffer: finalBuffer });
        }
      }
    };
  }

  process(inputs, outputs) {
    if (!this.isRecording) return true;

    // 获取输入数据
    const input = inputs[0][0]; // mono channel
    if (!input || input.length === 0) return true;

    // 将输入数据添加到缓冲区
    for (let i = 0; i < input.length; i++) {
      this.buffer[this.bufferIndex++] = input[i];

      // 当缓冲区填满时，发送给主线程
      if (this.bufferIndex >= this.frameSize) {
        this.port.postMessage({ buffer: this.buffer.slice() });
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor("opus-recorder-processor", OpusRecorderProcessor);
