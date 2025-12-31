import { isEqual } from "lodash";
import {
  AmbientLight,
  AnimationClip,
  AnimationMixer,
  Box3,
  Clock,
  Color,
  DirectionalLight,
  EquirectangularReflectionMapping,
  Euler,
  Group,
  LoopOnce,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Object3DEventMap,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
const workletUrl = new URL("./playback-worklet.js", import.meta.url);

type Options = {
  url: string;
};
interface streamOptions {
  sampleRate?: number;
  gain: number;
}
export class RIGRender {
  nodeAvatar: HTMLElement;
  audioCtx: AudioContext | null = null;
  audioSpeechSource: AudioBufferSourceNode | null = null;
  audioBackgroundSource: AudioBufferSourceNode | null = null;
  audioBackgroundGainNode: GainNode | null = null;
  audioSpeechGainNode: GainNode | null = null;
  audioStreamGainNode: GainNode | null = null;
  audioAnalyzerNode: AnalyserNode | null = null;
  audioReverbNode: ConvolverNode | null = null;
  workletLoaded: boolean = false;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  scene: Scene;
  lightAmbient: AmbientLight;
  lightDirect: DirectionalLight;
  resizeobserver: ResizeObserver;
  controls: OrbitControls;
  isRunning: boolean = false;
  url: string;
  model: Group<Object3DEventMap> | null = null;
  mixer: AnimationMixer | null = null;
  controlsEnd: Vector3 | null = null;
  cameraEnd: Vector3 | null = null;
  cameraClock: number | null = null;
  controlsStart: Vector3 | null = null;
  cameraStart: Vector3 | null = null;
  clock: Clock;
  currentAction: any;
  currentUrl: string = "";
  timer: any = null;
  isStreaming = false;
  streamWorkletNode: AudioWorkletNode | null = null;
  streamAudioStartTime = 0;
  streamLipsyncQueue: any[] = [];
  isSpeaking = false;
  animClock = 0;
  audioPlaylist: any[] = [];
  speechQueue: any[] = [];
  isAudioPlaying = false;
  actions: any;
  constructor(node: HTMLElement, opt: Options) {
    this.nodeAvatar = node;
    this.url = opt.url;
    this.initAudioGraph();

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(1 * window.devicePixelRatio);
    this.renderer.setSize(this.nodeAvatar.clientWidth, this.nodeAvatar.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.nodeAvatar.appendChild(this.renderer.domElement);
    this.camera = new PerspectiveCamera(45, this.nodeAvatar.clientWidth / this.nodeAvatar.clientHeight, 0.1, 2000);
    this.scene = new Scene();
    this.lightAmbient = new AmbientLight(new Color(0xeeeeee), 3);
    this.lightDirect = new DirectionalLight(new Color(0xffffff), 1);
    this.lightDirect.position.set(5, 10, 5);
    this.lightDirect.castShadow = true;
    this.scene.add(this.lightAmbient);
    this.scene.add(this.lightDirect);
    const loader = new RGBELoader();
    loader.load("/model/bg.hdr", texture => {
      texture.mapping = EquirectangularReflectionMapping;
      this.scene.environment = texture;
      // this.scene.background = texture;
    });
    const shadowMat = new ShadowMaterial({ opacity: 0.4 });
    const ground = new Mesh(new PlaneGeometry(50, 50), shadowMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.resizeobserver = new ResizeObserver(this.onResize.bind(this));
    this.resizeobserver.observe(this.nodeAvatar);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enableRotate = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 2000;
    this.controls.autoRotateSpeed = 0;
    this.controls.autoRotate = false;
    this.controls.minPolarAngle = Math.PI / 2; // 90 度
    this.controls.maxPolarAngle = Math.PI / 2; // 90 度
    this.controls.update();
    this.clock = new Clock();
    this.animate = this.animate.bind(this);
  }
  initAudioGraph(sampleRate?: number) {
    if (this.audioCtx && this.audioCtx.state !== "closed") this.audioCtx.close();
    this.audioCtx = new AudioContext({ sampleRate });
    this.audioSpeechSource = this.audioCtx.createBufferSource();
    this.audioBackgroundSource = this.audioCtx.createBufferSource();
    this.audioBackgroundGainNode = this.audioCtx.createGain();
    this.audioSpeechGainNode = this.audioCtx.createGain();
    this.audioStreamGainNode = this.audioCtx.createGain();
    this.audioAnalyzerNode = this.audioCtx.createAnalyser();
    this.audioAnalyzerNode.fftSize = 256;
    this.audioAnalyzerNode.smoothingTimeConstant = 0.1;
    this.audioAnalyzerNode.minDecibels = -70;
    this.audioAnalyzerNode.maxDecibels = -10;
    this.audioReverbNode = this.audioCtx.createConvolver();
    this.audioBackgroundGainNode.connect(this.audioReverbNode);
    this.audioAnalyzerNode.connect(this.audioSpeechGainNode);
    this.audioSpeechGainNode.connect(this.audioReverbNode);
    this.audioStreamGainNode.connect(this.audioReverbNode);
    this.audioReverbNode.connect(this.audioCtx.destination);
    this.setReverb();
  }
  setReverb() {
    const samplerate = this.audioCtx?.sampleRate!;
    const impulse = this.audioCtx?.createBuffer(2, samplerate, samplerate);
    if (!impulse || !this.audioReverbNode) return;
    impulse.getChannelData(0)[0] = 1;
    impulse.getChannelData(1)[0] = 1;
    this.audioReverbNode.buffer = impulse;
  }
  onResize() {
    this.camera.aspect = this.nodeAvatar.clientWidth / this.nodeAvatar.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.nodeAvatar.clientWidth, this.nodeAvatar.clientHeight);
    this.controls.update();
    this.render();
  }
  render() {
    if (this.isRunning) this.renderer?.render(this.scene!, this.camera!);
  }
  clearThree(obj: any) {
    while (obj.children.length) {
      this.clearThree(obj.children[0]);
      obj.remove(obj.children[0]);
    }
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      Object.keys(obj.material).forEach(x => {
        if (obj.material[x] && obj.material[x] !== null && typeof obj.material[x].dispose === "function") {
          obj.material[x].dispose();
        }
      });
      obj.material.dispose();
    }
  }
  async showModel(onProgress: (e: ProgressEvent) => void) {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(dracoLoader);

    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath("/basis/");
    ktx2Loader.detectSupport(this.renderer);
    loader.setKTX2Loader(ktx2Loader);

    const gltf = await loader.loadAsync(this.url, onProgress);
    const modelScene = gltf.scene;
    modelScene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material;
        if (mat.map) mat.map.colorSpace = SRGBColorSpace;
        mat.color.multiplyScalar(1);
        mat.metalness = 0.1;
        mat.envMapIntensity = 1.0;
        mat.needsUpdate = true;
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    const targetSize = 8; // 假设我们的场景刻度以 5 为基准
    const box = new Box3().setFromObject(modelScene);
    const scale = targetSize / Math.max(box.getSize(new Vector3()).x, box.getSize(new Vector3()).y);
    modelScene.scale.setScalar(scale);
    this.stop();
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    if (this.model) {
      this.scene.remove(this.model);
      this.clearThree(this.model);
      this.model = null;
    }
    this.scene.add(modelScene);
    this.model = modelScene;
    this.mixer = new AnimationMixer(modelScene);
    this.setView();
    this.start();
    this.startAnimation(gltf.animations);
  }
  start() {
    if (this.isRunning === false) {
      this.audioCtx?.resume();
      this.isRunning = true;
      this.animate();
    }
  }
  stop() {
    this.isRunning = false;
    this.audioCtx?.suspend();
  }
  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);
    this.controls.update();
    const delta = this.clock.getDelta();
    if (this.mixer) this.mixer.update(delta);
    this.render();
  }
  setView(viewname?: string) {
    const fov = this.camera.fov * (Math.PI / 180);
    let x = 0 * Math.tan(fov / 2);
    let y = Math.tan(fov / 2);
    let z = 0;
    switch (viewname) {
      case "upper":
        z += 4.5;
        y = y * z + (2 * 1.7) / 3;
        break;
      case "mid":
        z += 8;
        y = y * z + 1.7 / 3;
        break;
      default:
        z += 11;
        y = y * z - 0.7;
    }
    x = x * z;
    this.controlsEnd = new Vector3(x, y, 0);
    this.cameraEnd = new Vector3(x, y, z).applyEuler(new Euler(0, 0, 0));
    if (this.cameraClock === null) {
      this.controls.target.copy(this.controlsEnd);
      this.camera.position.copy(this.cameraEnd);
    }
    this.controlsStart = this.controls.target.clone();
    this.cameraStart = this.camera.position.clone();
    this.cameraClock = 0;
  }
  async setAction(url: string, loop = true) {
    if (!this.mixer) this.mixer = new AnimationMixer(this.model!);
    const loader = new FBXLoader();
    const fbx = await loader.loadAsync(url);
    let anim = fbx.animations[0];
    const newAction = this.mixer.clipAction(anim);
    newAction.reset();
    if (!loop) newAction.setLoop(LoopOnce, 1);
    newAction.clampWhenFinished = true;
    newAction.enabled = true;
    if (this.currentAction && this.currentAction !== newAction) {
      newAction.crossFadeFrom(this.currentAction, 0.5, false).play();
      this.currentAction.fadeOut(1);
    } else {
      newAction.fadeIn(1).play();
    }
    this.currentUrl = url;
    this.currentAction = newAction;
  }
  clone() {
    if (this.timer) clearTimeout(this.timer);
  }
  async streamStart(opt: streamOptions, onStart: () => void, onEnd: () => void) {
    this.stopSpeaking();
    this.isStreaming = true;
    this.isSpeaking = true;
    this.streamAudioStartTime = 0;
    this.streamLipsyncQueue = [];
    if (opt.sampleRate !== undefined) {
      const sr = opt.sampleRate;
      if (sr >= 8000 && sr <= 96000) {
        if (sr !== this.audioCtx?.sampleRate) this.initAudioGraph(sr);
      } else {
        console.warn("Invalid sampleRate provided. It must be a number between 8000 and 96000 Hz.");
      }
    }
    if (opt.gain !== undefined) this.audioStreamGainNode!.gain.value = opt.gain;
    if (!this.workletLoaded) {
      try {
        const loadPromise = this.audioCtx?.audioWorklet.addModule(workletUrl.href);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Worklet loading timed out")), 5000));
        await Promise.race([loadPromise, timeoutPromise]);
        this.workletLoaded = true;
      } catch (error) {
        console.error("Failed to load audio worklet:", error);
        throw new Error("Failed to initialize streaming speech");
      }
    }
    this.streamWorkletNode = new AudioWorkletNode(this.audioCtx!, "playback-worklet");
    this.streamWorkletNode.connect(this.audioStreamGainNode!);
    this.streamWorkletNode.connect(this.audioAnalyzerNode!);
    this.streamWorkletNode.port.onmessage = event => {
      if (event.data.type === "playback-started") {
        this.streamAudioStartTime = this.animClock;
        if (onStart) onStart();
      }
      if (event.data.type === "playback-ended") {
        this.streamStop();
        if (onEnd) onEnd();
      }
    };
    if (this.audioCtx?.state === "suspended") {
      const resume = this.audioCtx.resume();
      const timeout = new Promise((_r, rej) => setTimeout(() => rej("p2"), 1000));
      try {
        await Promise.race([resume, timeout]);
      } catch (e) {
        console.log("Can't play audio. Web Audio API suspended. This is often due to calling some speak method before the first user action, which is typically prevented by the browser.");
        return;
      }
    }
  }
  streamStop() {
    if (this.streamWorkletNode) {
      try {
        this.streamWorkletNode.disconnect();
      } catch (e) {
        console.error("Error disconnecting streamWorkletNode:", e);
      }
      this.streamWorkletNode = null;
    }
    this.isStreaming = false;
    this.isSpeaking = false;
    this.streamAudioStartTime = 0;
  }
  stopSpeaking() {
    try {
      this.audioSpeechSource?.stop();
    } catch (error) {}
    this.audioPlaylist.length = 0;
    this.speechQueue.length = 0;
    this.isSpeaking = false;
    this.isAudioPlaying = false;
  }
  streamNotifyEnd() {
    if (!this.isStreaming || !this.streamWorkletNode) return;
    this.streamWorkletNode.port.postMessage({ type: "no-more-data" });
  }
  streamAudio(r: any) {
    if (!this.isStreaming || !this.streamWorkletNode) return;
    if (r.audio instanceof ArrayBuffer) {
      this.streamWorkletNode.port.postMessage(r.audio, [r.audio]);
    } else if (r.audio instanceof Int16Array) {
      this.streamWorkletNode.port.postMessage(r.audio);
    } else {
      console.error("r.audio is not an ArrayBuffer or Int16Array. Cannot process audio of this type:", r.audio);
    }
  }
  startAnimation(arr: AnimationClip[]) {
    // 只监听一次
    this.actions = arr.map(clip => this.mixer!.clipAction(clip));
    const first = this.actions[0];
    first.reset();
    first.setLoop(LoopOnce, 1);
    first.clampWhenFinished = true;

    const onFinished = () => {
      this.mixer?.removeEventListener("finished", onFinished);
      this.setIdelAction();
    };

    this.mixer?.addEventListener("finished", onFinished);

    first.fadeIn(0.5).play();

    this.currentAction = first;
  }
  setTailkAction() {
    if (this.currentAction === this.actions[2]) return;
    this.playActionByIndex(2);
  }
  setIdelAction() {
    this.playActionByIndex(1);
  }
  setDanceAction() {
    this.playActionByIndex(3);
  }
  playActionByIndex(index: number) {
    const next = this.actions[index];
    // lodash 校验对象是否一样
    if (!next || isEqual(next, this.currentAction)) return;
    next.enabled = true;
    if (this.currentAction && this.currentAction !== next) {
      next.crossFadeFrom(this.currentAction, 0.5, false).play();
      this.currentAction.fadeOut(0.5);
    } else {
      next.fadeIn(0.5).play();
    }
    this.currentAction = next;
  }
  async closeAudioGraph() {
    // 1. 停止并释放 source（它们是一次性的节点）
    const stopSource = (source?: AudioBufferSourceNode | null) => {
      if (!source) return;
      try {
        source.stop(); // stop 只能调用一次
      } catch {}
      try {
        source.disconnect();
      } catch {}
    };

    stopSource(this.audioSpeechSource);
    stopSource(this.audioBackgroundSource);

    this.audioSpeechSource = null;
    this.audioBackgroundSource = null;

    // 2. 断开 GainNode / Analyzer / Reverb 连接
    const disconnectNode = (node?: AudioNode | null) => {
      if (!node) return;
      try {
        node.disconnect();
      } catch {}
    };

    disconnectNode(this.audioSpeechGainNode);
    disconnectNode(this.audioBackgroundGainNode);
    disconnectNode(this.audioStreamGainNode);
    disconnectNode(this.audioAnalyzerNode);
    disconnectNode(this.audioReverbNode);

    this.audioSpeechGainNode = null;
    this.audioBackgroundGainNode = null;
    this.audioStreamGainNode = null;
    this.audioAnalyzerNode = null;
    this.audioReverbNode = null;

    // 3. 关闭 AudioContext（异步）
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      try {
        await this.audioCtx.close();
      } catch {}
    }
    this.audioCtx = null;
  }
}
