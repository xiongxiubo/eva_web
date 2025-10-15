class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      // 只取第一声道
      const channelData = input[0];
      // 把 PCM 发送回主线程
      this.port.postMessage(channelData);
    }
    return true; // 返回 true 表示持续处理
  }
}

registerProcessor("recorder-processor", RecorderProcessor);
