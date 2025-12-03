import { AmbientLight, AnimationMixer, Box3, Color, DirectionalLight, Euler, MathUtils, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class RigRender {
  nodeAvatar: HTMLElement; // dom 节点
  visemeNames: typeof visemeNames = visemeNames; // 可见eme 名称
  lipsync: { en: Lipsync } = { en: new Lipsync() }; // 英文语音同步器
  renderer: WebGLRenderer | null = null; // 3d 渲染器
  scene: Scene | null = null; // 3d 场景
  camera: PerspectiveCamera | null = null; // 3d 相机
  lightAmbient: AmbientLight | null = null; // 环境光
  lightDirect: DirectionalLight | null = null; // 平行光
  resizeobserver: ResizeObserver | null = null; // 监听窗口变化
  isRunning: boolean = false; // 是否正在运行
  controls: OrbitControls | null = null; // 控制器
  dynamicbones: DynamicBones; // 动态骨骼
  audioCtx: AudioContext | null = null; // 音频上下文
  audioSpeechSource: AudioBufferSourceNode | null = null; // 语音源
  audioBackgroundSource: AudioBufferSourceNode | null = null; // 背景源
  audioBackgroundGainNode: GainNode | null = null; // 背景增益节点
  audioSpeechGainNode: GainNode | null = null; // 语音增益节点
  audioStreamGainNode: GainNode | null = null; // 流增益节点
  audioAnalyzerNode: AnalyserNode | null = null; // 分析器节点
  audioReverbNode: ConvolverNode | null = null; // 混响节点
  armature: any; // 骨骼
  controlsEnd: Vector3 | null = null; // 控制器结束位置
  cameraEnd: Vector3 | null = null; // 相机结束位置
  controlsStart: Vector3 | null = null; // 控制器开始位置
  cameraStart: Vector3 | null = null; // 相机开始位置
  cameraClock: number | null = null; // 相机时钟
  mixer: AnimationMixer | null = null; // 动画混合器
  animTimeLast = 0; // 上一帧时间
  animFrameDur = 1000 / 60; // 一帧时间
  animSlowdownRate = 1.0; // 动画减速率
  animClock = 0; // 动画时钟

  constructor(nodeAvatar: HTMLElement) {
    this.nodeAvatar = nodeAvatar; // dom 节点
    this.initAudio(); // 初始化音频上下文
    this.init3D(); // 初始化 3d 场景 以及渲染器
    this.dynamicbones = new DynamicBones(); // 动态骨骼
  }
  // 初始化音频
  initAudio(sampleRate?: number) {
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
  // 初始化 3d 场景 以及渲染器
  init3D() {
    // 渲染器
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(1 * window.devicePixelRatio);
    this.renderer.setSize(this.nodeAvatar.clientWidth, this.nodeAvatar.clientHeight);
    this.renderer.shadowMap.enabled = false;
    this.nodeAvatar.appendChild(this.renderer.domElement);
    //场景
    this.scene = new Scene();
    // 相机
    this.camera = new PerspectiveCamera(60, this.nodeAvatar.clientWidth / this.nodeAvatar.clientHeight, 0.1, 20000);
    //灯光
    this.lightAmbient = new AmbientLight(new Color(0xeeeeee), 3);
    this.lightDirect = new DirectionalLight(new Color(0xffffff), 1);
    this.scene.add(this.lightAmbient);
    this.scene.add(this.lightDirect);
    // 监听窗口变化
    this.resizeobserver = new ResizeObserver(this.onResize.bind(this));
    this.resizeobserver.observe(this.nodeAvatar);
    // 控制器
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
  }
  onResize() {
    if (!this.camera || !this.renderer || !this.controls) return;
    this.camera.aspect = this.nodeAvatar.clientWidth / this.nodeAvatar.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.nodeAvatar.clientWidth, this.nodeAvatar.clientHeight);
    this.controls.update();
    this.render();
  }
  render() {
    if (this.isRunning) this.renderer?.render(this.scene!, this.camera!);
  }
  // 展示3d模型
  async showModel(url: string, onProgress?: (e: ProgressEvent) => void) {
    const loader = new FBXLoader();
    // // 开启 draco 压缩
    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    // loader.setDRACOLoader(dracoLoader);
    const obj = await loader.loadAsync(url, onProgress);
    // 将fbx模型加入场景
    if (!this.mixer) this.mixer = new AnimationMixer(obj);
    // 模型添加到场景中
    this.scene?.add(obj);
    // 模型居中，相机自适应
    const box = new Box3().setFromObject(obj);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxDim / (2 * Math.tan((this.camera!.fov * Math.PI) / 360));
    const distance = fitHeightDistance * 1.5;
    this.camera?.position.set(center.x, center.y, center.z + distance);
    this.camera!.far = distance * 10;
    this.camera!.updateProjectionMatrix();
    this.controls?.target.copy(center); // 如果用了 OrbitControls
    // 找到骨骼
    this.armature = obj.getObjectByName("root");
    this.armature.scale.setScalar(1);
    console.log(obj.animations[0]);
    this.start();
    this.playAnimation("/model/Catwalk.glb");
    // this.playFbxAnimation("/model/KickPole.fbx");
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
    if (dt > 2 * this.animFrameDur) dt = 2 * this.animFrameDur;
    if (this.mixer) this.mixer.update((dt / 1000) * this.mixer.timeScale);
    this.render();
  }
  // 播放动画
  async playAnimation(url: string) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    const animation = gltf.animations[0];

    console.log(animation);
    const action = this.mixer?.clipAction(animation);
    action?.fadeIn(0.5).play();
    const neck = this.armature?.getObjectByName("neckx");
    neck.rotation.x += MathUtils.degToRad(10);
  }
  // 播放fbx动作
  async playFbxAnimation(url: string) {
    const loader = new FBXLoader();
    const fbx = await loader.loadAsync(url);
    const animation = fbx.animations[0];
    console.log(animation);
    const action = this.mixer?.clipAction(animation);
    action?.fadeIn(0.5).play();
  }
}
