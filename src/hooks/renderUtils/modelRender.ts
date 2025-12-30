import {
  AnimationMixer,
  SRGBColorSpace,
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  AmbientLight,
  Color,
  DirectionalLight,
  Vector3,
  Euler,
  Spherical,
  type Object3DEventMap,
  Group,
  EquirectangularReflectionMapping,
  LoopOnce,
  PCFSoftShadowMap,
  Mesh,
  PlaneGeometry,
  ShadowMaterial,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { DynamicBones } from "./dynamicbones";
import { Lipsync } from "./lipsync";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
const workletUrl = new URL("./playback-worklet.js", import.meta.url);
interface streamOptions {
  sampleRate?: number;
  gain: number;
}
interface Options {
  url: string;
  actionurl: any[];
  action: string;
}
export class ModelRender {
  nodeAvatar: HTMLElement;
  lipsync: any;
  audioCtx: AudioContext | null = null;
  audioSpeechSource: AudioBufferSourceNode | null = null;
  audioBackgroundSource: AudioBufferSourceNode | null = null;
  audioBackgroundGainNode: GainNode | null = null;
  audioSpeechGainNode: GainNode | null = null;
  audioStreamGainNode: GainNode | null = null;
  audioAnalyzerNode: AnalyserNode | null = null;
  audioReverbNode: ConvolverNode | null = null;
  workletLoaded: boolean = false;
  audioPlaylist: any[] = [];
  volumeFrequencyData = new Uint8Array(16);
  volumeMax = 0;
  volumeHeadBase = 0;
  volumeHeadTarget = 0;
  volumeHeadCurrent = 0;
  volumeHeadVelocity = 0.15;
  volumeHeadEasing = this.sigmoidFactory(3);
  dracoDecoderPath = "https://www.gstatic.com/draco/v1/decoders/";
  stateName = "idle";
  speechQueue: any[] = [];
  isSpeaking = false;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  scene: Scene;
  isRunning = false;
  resizeobserver: ResizeObserver;
  controls: OrbitControls;
  cameraClock: any;
  dynamicbones: DynamicBones;
  isStreaming = false;
  streamWorkletNode: AudioWorkletNode | null = null;
  streamAudioStartTime = 0;
  streamLipsyncQueue: any[] = [];
  model: Group<Object3DEventMap> | null = null;
  armature: any | null = null;
  lightAmbient: AmbientLight;
  lightDirect: DirectionalLight;
  morphs: any[] = [];
  animTimeLast = 0;
  animFrameDur = 1000 / 30;
  animSlowdownRate = 1;
  animClock = 0;
  visemeNames: typeof visemeNames = visemeNames;
  isAudioPlaying = false;
  animQueue: any[] = [];
  cameraView: string = "full";
  controlsEnd: Vector3 | null = null;
  cameraEnd: Vector3 | null = null;
  controlsStart: Vector3 | null = null;
  cameraStart: Vector3 | null = null;
  easing = this.sigmoidFactory(5);
  mtAvatar: any = {};
  blinkMorphs: any[] = [];
  mixer: AnimationMixer | null = null;
  animEmojis: any = {};
  morphdict: any = {};
  url: string;
  blinkState: {
    nextBlinkTime: number;
    blinkDuration: number;
    blinkProgress: number;
    isBlinking: boolean;
  };
  currentAction: any;
  currentUrl: string = "";
  timer: any = null;
  actionurl: any[] = [];
  action: string;
  constructor(node: HTMLElement, options: Options) {
    this.nodeAvatar = node;
    this.url = options.url;
    this.actionurl = options.actionurl;
    this.action = options.action;
    this.lipsync = { en: new Lipsync() };
    this.initAudioGraph();
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(1 * window.devicePixelRatio);
    this.renderer.setSize(this.nodeAvatar.clientWidth, this.nodeAvatar.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.nodeAvatar.appendChild(this.renderer.domElement);
    this.camera = new PerspectiveCamera(10, this.nodeAvatar.clientWidth / this.nodeAvatar.clientHeight, 0.1, 2000);
    this.scene = new Scene();
    this.lightAmbient = new AmbientLight(new Color(0xeeeeee), this.action === "A" ? 1 : 3);
    this.lightDirect = new DirectionalLight(new Color(0xffffff), 1);
    this.lightDirect.position.set(5, 10, 5);
    this.lightDirect.castShadow = true;

    if (this.action === "A") {
      const loader = new RGBELoader();
      loader.load("/model/bg.hdr", texture => {
        texture.mapping = EquirectangularReflectionMapping;
        this.scene.environment = texture;
        // this.scene.background = texture;
      });
    }
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
    this.dynamicbones = new DynamicBones();
    this.animEmojis = animEmojis;
    // 初始化眨眼状态
    this.blinkState = {
      nextBlinkTime: 0,
      blinkDuration: 200,
      blinkProgress: 0,
      isBlinking: false,
    };
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
  sigmoidFactory(k: number) {
    function base(t: number) {
      return 1 / (1 + Math.exp(-k * t)) - 0.5;
    }
    var corr = 0.5 / base(1);
    return function (t: number) {
      return corr * base(2 * Math.max(Math.min(t, 1), 0) - 1) + 0.5;
    };
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
  async showModel(onProgress?: (event: ProgressEvent) => void) {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(this.dracoDecoderPath);
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

    this.stop();
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    this.dynamicbones.dispose();
    if (this.model) {
      this.scene.remove(this.model);
      this.clearThree(this.model);
      this.model = null;
    }
    // 4. 重置状态
    this.armature = null;
    this.morphs = [];
    this.morphdict = {};
    // 5. 设置新模型
    this.scene.add(modelScene);
    this.model = modelScene;
    this.mixer = new AnimationMixer(modelScene);
    // 6. 初始化模型组件
    this.armature = modelScene.getObjectByName(this.action === "A" ? "AvatarRoot" : "Armature");
    if (!this.armature) throw new Error("Armature not found in model");
    this.armature.scale.setScalar(1);
    this.armature.traverse((x: any) => {
      if (x.morphTargetInfluences && x.morphTargetInfluences.length && x.morphTargetDictionary) {
        this.morphs.push(x);
        this.morphdict = x.morphTargetDictionary;
      }
      x.frustumCulled = false;
    });
    const keys = new Set();
    this.morphs.forEach(x => {
      Object.keys(x.morphTargetDictionary).forEach(y => keys.add(y));
    });
    const mtTemp: any = {};
    keys.forEach((x: any) => {
      mtTemp[x] = {
        fixed: null,
        system: null,
        systemd: null,
        newvalue: null,
        ref: null,
        min: 0,
        max: 5,
        easing: this.sigmoidFactory(5),
        base: null,
        v: 0,
        needsUpdate: true,
        acc: 0.01 / 1000,
        maxv: 5 / 1000,
        limit: null,
        onchange: null,
        baseline: 0,
        ms: [],
        is: [],
      };
      mtTemp[x].value = mtTemp[x].baseline;
      mtTemp[x].applied = mtTemp[x].baseline;
      const y = this.mtAvatar[x];
      if (y) {
        ["fixed", "system", "systemd", "base", "v", "value", "applied"].forEach(z => {
          mtTemp[x][z] = y[z];
        });
      }
      this.morphs.forEach(y => {
        const ndx = y.morphTargetDictionary[x];
        if (ndx !== undefined) {
          mtTemp[x].ms.push(y.morphTargetInfluences);
          mtTemp[x].is.push(ndx);
          y.morphTargetInfluences[ndx] = mtTemp[x].applied;
        }
      });
    });
    this.mtAvatar = mtTemp;
    this.scene.add(this.lightAmbient);
    this.scene.add(this.lightDirect);
    this.setView();
    this.start();
    this.initBlink();
    // 7. 播放动作
    this.actionProcess();
  }
  initBlink() {
    this.blinkMorphs = [];
    this.armature.traverse((obj: any) => {
      if (!obj.morphTargetDictionary || !obj.morphTargetInfluences) return;
      const dict = obj.morphTargetDictionary;
      const L = dict["eyeBlinkLeft"];
      const R = dict["eyeBlinkRight"];
      if (L !== undefined || R !== undefined) {
        this.blinkMorphs.push({
          mesh: obj,
          leftIndex: L,
          rightIndex: R,
        });
      }
    });
    this.blinkState.nextBlinkTime = this.animClock + (5000 + Math.random() * 3000);
    this.blinkState.blinkProgress = 0;
    this.blinkState.isBlinking = false;
  }
  startBlink() {
    this.blinkState.isBlinking = true;
    this.blinkState.blinkProgress = 0;
  }
  updateBlink(dt: number) {
    if (this.blinkMorphs.length === 0) return;
    if (!this.blinkState.isBlinking && this.animClock >= this.blinkState.nextBlinkTime) {
      this.startBlink();
      this.blinkState.nextBlinkTime = this.animClock + (5000 + Math.random() * 3000);
    }
    if (this.blinkState.isBlinking) {
      this.blinkState.blinkProgress += dt;
      const t = this.blinkState.blinkProgress / this.blinkState.blinkDuration;
      const blinkIntensity = Math.sin(Math.min(t, 1) * Math.PI);
      for (const morph of this.blinkMorphs) {
        if (morph.leftIndex !== undefined) morph.mesh.morphTargetInfluences[morph.leftIndex] = blinkIntensity;
        if (morph.rightIndex !== undefined) morph.mesh.morphTargetInfluences[morph.rightIndex] = blinkIntensity;
      }
      if (t >= 2) {
        this.blinkState.isBlinking = false;
        this.blinkState.blinkProgress = 0;
      }
    }
  }
  start() {
    if (this.armature && this.isRunning === false) {
      this.audioCtx?.resume();
      this.isRunning = true;
      requestAnimationFrame(this.animate?.bind(this));
    }
  }
  stop() {
    this.isRunning = false;
    this.audioCtx?.suspend();
  }
  animate(t: any) {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate.bind(this));
    let dt = t - this.animTimeLast;
    if (dt < this.animFrameDur) return;
    dt = dt / this.animSlowdownRate;
    this.animClock += dt;
    this.animTimeLast = t;
    let i,
      j,
      l,
      k,
      vol = 0;
    if (this.isSpeaking) {
      vol = 0;
      this.audioAnalyzerNode?.getByteFrequencyData(this.volumeFrequencyData);
      for (i = 2, l = 10; i < l; i++) {
        if (this.volumeFrequencyData[i] > vol) vol = this.volumeFrequencyData[i];
      }
    }
    for (i = 0, l = this.animQueue.length; i < l; i++) {
      const x = this.animQueue[i];
      if (this.animClock < x.ts[0]) continue;
      for (j = x.ndx || 0, k = x.ts.length; j < k; j++) {
        if (this.animClock < x.ts[j]) break;
        for (let [mt, vs] of Object.entries(x.vs) as any) {
          if (this.mtAvatar.hasOwnProperty(mt)) {
            if (vs[j + 1] === null) continue;
            const m = this.mtAvatar[mt];
            if (vs[j] === null) vs[j] = m.value;
            if (j === k - 1) {
              m.newvalue = vs[j];
            } else {
              m.newvalue = vs[j + 1];
              const tdiff = x.ts[j + 1] - x.ts[j];
              let alpha = 1;
              if (tdiff > 0.0001) alpha = (this.animClock - x.ts[j]) / tdiff;
              if (alpha < 1) {
                if (m.easing) alpha = m.easing(alpha);
                m.newvalue = (1 - alpha) * vs[j] + alpha * m.newvalue;
              }
              if (m.ref && m.ref !== x.vs && m.ref.hasOwnProperty(mt)) delete m.ref[mt];
              m.ref = x.vs;
            }
            if (vol) {
              switch (mt) {
                case "viseme_aa":
                case "viseme_E":
                case "viseme_I":
                case "viseme_O":
                case "viseme_U":
                  m.newvalue *= 1 + vol / 255 - 0.5;
              }
            }
            m.needsUpdate = true;
          }
        }
      }
      if (j === k) {
        this.animQueue.splice(i--, 1);
        l--;
      } else {
        x.ndx = j - 1;
      }
    }
    if (dt > 2 * this.animFrameDur) dt = 2 * this.animFrameDur;
    this.dynamicbones.update(dt);
    this.updateMorphTargets(dt);
    this.updateBlink(dt);

    if (this.cameraClock !== null && this.cameraClock < 1000) {
      this.cameraClock += dt;
      if (this.cameraClock > 1000) this.cameraClock = 1000;
      let s = new Spherical().setFromVector3(this.cameraStart!);
      let sEnd = new Spherical().setFromVector3(this.cameraEnd!);
      s.phi += this.easing(this.cameraClock / 1000) * (sEnd.phi - s.phi);
      s.theta += this.easing(this.cameraClock / 1000) * (sEnd.theta - s.theta);
      s.radius += this.easing(this.cameraClock / 1000) * (sEnd.radius - s.radius);
      s.makeSafe();
      this.camera.position.setFromSpherical(s);
      if (this.controlsStart?.x !== this.controlsEnd?.x) {
        this.controls.target.copy(this.controlsStart!.lerp(this.controlsEnd!, this.easing(this.cameraClock / 1000)));
      } else {
        s.setFromVector3(this.controlsStart!);
        sEnd.setFromVector3(this.controlsEnd!);
        s.phi += this.easing(this.cameraClock / 1000) * (sEnd.phi - s.phi);
        s.theta += this.easing(this.cameraClock / 1000) * (sEnd.theta - s.theta);
        s.radius += this.easing(this.cameraClock / 1000) * (sEnd.radius - s.radius);
        s.makeSafe();
        this.controls.target.setFromSpherical(s);
      }
      this.controls.update();
    }
    if (this.mixer) this.mixer.update((dt / 1000) * this.mixer.timeScale);
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
        y = this.action === "A" ? y * z : y * z - 0.05;
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
  resetLips() {
    this.visemeNames.forEach(x => {
      this.morphs.forEach(y => {
        const ndx = y.morphTargetDictionary[x];
        if (ndx !== undefined) y.morphTargetInfluences[ndx] = 0;
      });
    });
  }
  lipsyncPreProcessText(s: string, lang: string) {
    const o = this.lipsync[lang] || Object.values(this.lipsync)[0];
    return o.preProcessText(s);
  }
  lipsyncWordsToVisemes(word: string, lang: string) {
    const o = this.lipsync[lang] || Object.values(this.lipsync)[0];
    return o.wordsToVisemes(word);
  }
  stopSpeaking() {
    try {
      this.audioSpeechSource?.stop();
    } catch (error) {}
    this.audioPlaylist.length = 0;
    this.speechQueue.length = 0;
    this.animQueue = this.animQueue.filter(x => x.template.name !== "viseme" && x.template.name !== "subtitles" && x.template.name !== "blendshapes");
    this.stateName = "idle";
    this.isSpeaking = false;
    this.isAudioPlaying = false;
    if (this.armature) {
      this.resetLips();
      this.render();
    }
  }
  async streamStart(opt: streamOptions, onStart: () => void, onEnd: () => void) {
    this.stopSpeaking();
    this.isStreaming = true;
    this.isSpeaking = true;
    this.stateName = "speaking";
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
        this._processStreamLipsyncQueue();
        if (onStart) onStart();
      }
      if (event.data.type === "playback-ended") {
        this.streamStop();
        if (onEnd) onEnd();
      }
    };
    this.resetLips();
    if (this.audioCtx?.state === "suspended" || this.audioCtx?.state === "interrupted") {
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
  streamNotifyEnd() {
    if (!this.isStreaming || !this.streamWorkletNode) return;
    this.streamWorkletNode.port.postMessage({ type: "no-more-data" });
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
    this.stateName = "idle";
    this.streamAudioStartTime = 0;
    if (this.armature) {
      this.resetLips();
      this.render();
    }
  }
  _processStreamLipsyncQueue() {
    while (this.streamLipsyncQueue.length > 0) {
      const lipsyncPayload = this.streamLipsyncQueue.shift();
      this._processLipsyncData(lipsyncPayload, this.streamAudioStartTime);
    }
  }
  _processLipsyncData(r: any, audioStart: number) {
    for (let i = 0; i < r.words.length; i++) {
      const word = r.words[i];
      const time = r.wtimes[i];
      let duration = r.wdurations[i];
      if (word.length === 0) continue;
      const lipsyncLang = "en";
      const wrd = this.lipsyncPreProcessText(word, lipsyncLang);
      const val = this.lipsyncWordsToVisemes(wrd, lipsyncLang);
      if (val && val.visemes && val.visemes.length) {
        const dTotal = val.times[val.visemes.length - 1] + val.durations[val.visemes.length - 1];
        const overdrive = Math.min(duration, Math.max(0, duration - val.visemes.length * 150));
        let level = 0.6 + this.convertRange(overdrive, [0, duration], [0, 0.4]);
        duration = Math.min(duration, val.visemes.length * 200);
        if (dTotal > 0) {
          for (let j = 0; j < val.visemes.length; j++) {
            const t = audioStart + time + (val.times[j] / dTotal) * duration;
            const d = (val.durations[j] / dTotal) * duration;
            const viseme = this.action === "A" ? val.visemes[j] : "viseme_" + val.visemes[j];
            this.animQueue.push({
              template: { name: "viseme" },
              ts: [t - Math.min(60, (2 * d) / 3), t + Math.min(25, d / 2), t + d + Math.min(60, d / 2)],
              vs: {
                [viseme]: [null, viseme === "PP" || viseme === "FF" ? 0.9 : level, 0],
              },
            });
          }
        }
      }
    }
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
    if (r.words) {
      if (!this.streamAudioStartTime) return this.streamLipsyncQueue.push(r);
      this._processLipsyncData(r, this.streamAudioStartTime);
    }
  }
  convertRange(value: number, r1: any[], r2: number[]) {
    return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
  }
  updateMorphTargets(dt: number) {
    for (let [mt, o] of Object.entries(this.mtAvatar) as any) {
      if (!o.needsUpdate) continue;
      let target = null;
      let newvalue = null;
      if (o.fixed !== null) {
        target = o.fixed;
        o.system = null;
        o.systemd = null;
        o.newvalue = null;
        if (o.ref && o.ref.hasOwnProperty(mt)) delete o.ref[mt];
        o.ref = null;
        o.base = null;
        if (o.value === target) {
          o.needsUpdate = false;
          continue;
        }
      } else if (o.system !== null) {
        target = o.system;
        o.newvalue = null;
        if (o.ref && o.ref.hasOwnProperty(mt)) delete o.ref[mt];
        o.ref = null;
        o.base = null;
        if (o.systemd !== null) {
          if (o.systemd === 0) {
            target = null;
            o.system = null;
            o.systemd = null;
          } else {
            o.systemd -= dt;
            if (o.systemd < 0) o.systemd = 0;
            if (o.value === target) {
              target = null;
            }
          }
        } else if (o.value === target) {
          target = null;
          o.system = null;
        }
      } else if (o.newvalue !== null) {
        o.ref = null;
        o.base = null;
        newvalue = o.newvalue;
        o.newvalue = null;
      } else if (o.base !== null) {
        target = o.base;
        o.ref = null;
        if (o.value === target) {
          target = null;
          o.base = null;
          o.needsUpdate = false;
        }
      } else {
        o.ref = null;
        if (o.baseline !== null && o.value !== o.baseline) {
          target = o.baseline;
          o.base = o.baseline;
        } else {
          o.needsUpdate = false;
        }
      }
      if (target !== null) {
        let diff = target - o.value;
        if (diff >= 0) {
          if (diff < 0.005) {
            newvalue = target;
            o.v = 0;
          } else {
            if (o.v < o.maxv) o.v += o.acc * dt;
            if (o.v >= 0) {
              newvalue = o.value + diff * (1 - Math.exp(-o.v * dt));
            } else {
              newvalue = o.value + o.v * dt * (1 - Math.exp(o.v * dt));
            }
          }
        } else {
          if (diff > -0.005) {
            newvalue = target;
            o.v = 0;
          } else {
            if (o.v > -o.maxv) o.v -= o.acc * dt;
            if (o.v >= 0) {
              newvalue = o.value + o.v * dt * (1 - Math.exp(-o.v * dt));
            } else {
              newvalue = o.value + diff * (1 - Math.exp(o.v * dt));
            }
          }
        }
      }
      if (o.limit !== null) {
        if (newvalue !== null && newvalue !== o.value) {
          o.value = newvalue;
          if (o.onchange !== null) o.onchange(newvalue);
        }
        newvalue = o.limit(o.value);
        if (newvalue === o.applied) continue;
      } else {
        if (newvalue === null || newvalue === o.value) continue;
        o.value = newvalue;
        if (o.onchange !== null) o.onchange(newvalue);
      }
      o.applied = newvalue;
      if (o.applied < o.min) o.applied = o.min;
      if (o.applied > o.max) o.applied = o.max;
      for (let i = 0, l = o.ms.length; i < l; i++) {
        o.ms[i][o.is[i]] = o.applied;
      }
    }
  }
  playEmoji(emoji: string) {
    const animemoji = this.animEmojis[emoji];
    if (!animemoji) return;
    this.applyEmoji(animemoji);
  }
  applyEmoji(animemoji: any) {
    const { dt, rescale, vs } = animemoji;
    const [startDelay, endDelay] = dt;
    const [minVal, maxVal] = rescale;
    const duration = endDelay - startDelay;
    const animationStartTime = performance.now() + startDelay;
    const animationEndTime = performance.now() + endDelay;
    let recoverStart = 0;
    // === 第一阶段：立即应用数值（无渐变）===
    const applyInstant = () => {
      this.armature.traverse((obj: any) => {
        if (!obj.morphTargetDictionary || !obj.morphTargetInfluences) return;
        const dict = obj.morphTargetDictionary;
        for (const morphName in vs) {
          const index = dict[morphName];
          if (index === undefined) continue;
          const targetVal = vs[morphName];
          const val = minVal + (maxVal - minVal) * targetVal; // 直接达到预设值
          obj.morphTargetInfluences[index] = val;
        }
      });
    };
    // === 第二阶段：恢复动画（渐变回 0）===
    const animateOut = (now: number) => {
      if (!recoverStart) recoverStart = now;
      const elapsed = now - recoverStart;
      const t = Math.min(elapsed / duration, 1); // 0 → 1
      this.armature.traverse((obj: any) => {
        if (!obj.morphTargetDictionary || !obj.morphTargetInfluences) return;
        const dict = obj.morphTargetDictionary;
        for (const morphName in vs) {
          const index = dict[morphName];
          if (index === undefined) continue;
          const targetVal = vs[morphName];
          const maxValNow = minVal + (maxVal - minVal) * targetVal;
          obj.morphTargetInfluences[index] = maxValNow * (1 - t); // 预设值 → 0
        }
      });
      if (t < 1) requestAnimationFrame(animateOut);
    };
    const waitAndStart = (now: number) => {
      if (now < animationStartTime) {
        requestAnimationFrame(waitAndStart);
        return;
      }
      // 立即应用目标
      applyInstant();
      // 等待到结束点，再开始恢复
      const waitEnd = (now2: number) => {
        if (now2 < animationEndTime) {
          requestAnimationFrame(waitEnd);
        } else {
          requestAnimationFrame(animateOut);
        }
      };
      requestAnimationFrame(waitEnd);
    };
    requestAnimationFrame(waitAndStart);
  }
  async setAction(url: string, loop = true) {
    if (!this.mixer) this.mixer = new AnimationMixer(this.model!);
    const loader = new FBXLoader();
    const fbx = await loader.loadAsync(url);
    let anim = fbx.animations[0];
    const fixedTracks: any = [];
    anim.tracks.forEach(t => {
      switch (this.action) {
        case "A":
        case "AN":
          t.name = t.name.replace(/mixamorig:|mixamorig|Armature\|/g, "");
          if (t.name.endsWith(".scale")) return;
          break;
        case "M":
          t.name = t.name.replaceAll("mixamorig", "");
          const ids = t.name.split(".");
          if (ids[1] === "position") {
            for (let i = 0; i < t.values.length; i++) {
              t.values[i] = t.values[i] * 0.01;
            }
          }
          break;
      }
      fixedTracks.push(t);
    });
    anim.tracks = fixedTracks;
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
  private randomAction() {
    const arr = this.actionurl.filter(e => e.type === "idle" && !e.is_default);
    const index = Math.floor(Math.random() * arr.length);
    return arr[index].url;
  }
  actionProcess() {
    const url = this.actionurl.find(e => e.type === "hello")?.url;
    this.mixer?.addEventListener("finished", () => {
      this.setIdelAction();
    });
    this.setAction(url, false);
  }
  setTailkAction() {
    const url = this.actionurl.find(e => e.type === "speaker")?.url;
    if (this.currentUrl === url) return;
    this.clone();
    this.setAction(url);
  }
  setIdelAction() {
    const url = this.actionurl.find(e => e.type === "idle" && e.is_default)?.url;
    this.setAction(url);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setAction(this.randomAction(), false);
    }, 60000);
  }
  clone() {
    if (this.timer) clearTimeout(this.timer);
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
