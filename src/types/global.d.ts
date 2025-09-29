declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: any);
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
declare const sampleRate: number;
declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;

interface Window {
  ModuleInstance?: any;
  webkitAudioContext?: any;
  opusLoaded?: boolean;
}

declare const Module: any;
