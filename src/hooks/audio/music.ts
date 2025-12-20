export class Music {
  private audioContext: AudioContext;
  private sourceNode: AudioBufferSourceNode | null = null;
  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // 播放音乐
  async play(data: ArrayBuffer | Blob) {
    if (this.audioContext.state === "suspended") await this.audioContext.resume();
    const arrayBuffer = data instanceof Blob ? await data.arrayBuffer() : data;
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.pauseMusic();
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = audioBuffer;
      this.sourceNode.connect(this.audioContext.destination);
      this.sourceNode.start();
    } catch (error) {
      console.error("播放音乐失败:", error);
    }
  }
  // 暂停音乐
  pauseMusic() {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch {}
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }
  async pauseContext() {
    if (this.audioContext.state === "running") await this.audioContext.suspend();
  }

  async resumeContext() {
    if (this.audioContext.state === "suspended") await this.audioContext.resume();
  }
  // 关闭音乐
  close() {
    this.pauseMusic();
    this.audioContext.close();
  }
}
