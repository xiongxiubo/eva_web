// @ts-ignore 忽略找不到模块声明文件的错误
import { TalkingHead } from "./talkinghead.mjs";
import { ElMessage, ElMessageBox } from "element-plus";

const SAMPLE_RATE = 16000;
const CHANNELS = 1;
const BUFFER_SEND_INTERVAL = 100; // 每100ms发送一次
const BUFFER_MAX_CHUNKS = 5; // 超过5帧立即发送
let heartbeatTimer: any = null;
const HEARTBEAT_INTERVAL = 30000; // 心跳间隔 30s

type WsType = "audio" | "text" | "image" | "end" | "sub";

type sendMsgType = {
  type: WsType;
  data?: string;
};
export function useAudio(avatarref: any) {
  const { chattingAi } = storeToRefs(useTalkieStore());
  const { token } = storeToRefs(useUserStore());
  const route = useRoute();
  const router = useRouter();
  //3d模型实例
  let head = shallowRef<TalkingHead | null>(null);
  // websocket实例
  const ws = ref<WebSocket | null>(null);
  const wsMsg = ref<any>();
  // 状态
  const state = reactive({
    isRecording: false,
    isConnected: false,
    isStreaming: false,
  });
  const loading = ref(true);

  // 音频上下文
  let audioContext: AudioContext = new (window.AudioContext || window.webkitAudioContext)();
  let mediaStream: MediaStream | null = null;
  let mediaSource: MediaStreamAudioSourceNode | null = null;
  let audioProcessor: AudioWorkletNode | null = null;
  //音乐上下文
  let audioContextMusic: AudioContext = new (window.AudioContext || window.webkitAudioContext)();
  let sourceNode: AudioBufferSourceNode | null = null;

  let bufferQueue: any[] = []; //缓冲队列
  let sendBuffer: ArrayBuffer[] = []; // 发送缓冲区
  let bufferTimer: number | null = null; // 发送定时器
  let isSpeaker = ref(false); // 说话人是否可以说话

  // 播放音乐
  async function playMusic(arrayBuffer: ArrayBuffer | Blob) {
    if (arrayBuffer instanceof Blob) {
      arrayBuffer = await arrayBuffer.arrayBuffer();
    }

    const audioBuffer = await audioContextMusic.decodeAudioData(arrayBuffer);
    pauseMusic();

    sourceNode = audioContextMusic.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(audioContextMusic.destination);
    sourceNode.start();
  }
  // 关闭音乐
  async function pauseMusic() {
    try {
      sourceNode?.stop();
    } catch (error) {}
    sourceNode?.disconnect();
  }
  async function NewHead() {
    head.value = new TalkingHead(avatarref.value, {
      ttsEndpoint: "https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize",
      lipsyncModules: ["en"],
      cameraView: "full",
    });
  }
  // 初始化head实例
  async function initHead() {
    if (!avatarref.value) return;
    await head.value?.showAvatar(
      {
        url: chattingAi.value?.model_3d,
        body: chattingAi.value?.gender,
        avatarMood: "neutral",
        lipsyncLang: "en",
      },
      (e: any) => {
        if (e.loaded === e.total) {
          setTimeout(() => {
            loading.value = false;
          }, 2000);
        }
      },
    );
    // head.value.playAnimation("/121560902_p.fbx");
  }
  // 连接websocket
  function connectWebSocket() {
    ws.value = new WebSocket(`${import.meta.env.VITE_WEBSOCKET}/api/ws?token=${token.value}`);
    ws.value.onopen = () => {
      state.isConnected = true;
      sendMessage({
        type: "sub",
        data: route.params.id as string,
      });
      startHeartbeat();
    };
    ws.value.onclose = () => {
      // ElMessage.error("WebSocket连接关闭");
      state.isConnected = false;
      stopHeartbeat();
    };
    ws.value.onerror = () => {
      ElMessage.error("WebSocket连接错误");
      state.isConnected = false;
    };
    ws.value.onmessage = event => {
      if (typeof event.data === "string") {
        //文本包含身份认证略过
        if (event.data.includes("身份认证")) return;
        if (event.data.includes("新设备")) {
          localStorage.removeItem("token");
          token.value = "";
          ElMessageBox.alert("登录过期，请重新登录", "提示", {
            confirmButtonText: "确定",
            type: "warning",
          }).then(() => {
            router.push("/login");
          });
        }
        const message = JSON.parse(event.data);
        parseWebsocketMessage(message);
      } else {
        playMusic(event.data);
      }
    };
  }
  // 心跳检测
  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({ type: "ping" }));
        console.log("➡️ 发送心跳 ping");
      }
    }, HEARTBEAT_INTERVAL);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  async function parseWebsocketMessage(message: any) {
    switch (message.type) {
      case "user":
        wsMsg.value = {
          ID: new Date().getTime(),
          role: "user",
          content: message.text,
        };
        // isSpeaker.value = true;
        break;
      case "audio":
        if (message.text !== "end") {
          wsMsg.value = {
            ID: new Date().getTime(),
            role: "assistant",
            content: message.text,
          };
          handleTextMessage(message);
        }
        break;
      case "emotion":
        if (message.data.length > 1) {
          const arr = Array.from(message.text);
          arr.forEach((item: any) => {
            head.value?.speakEmoji(item);
          });
        } else {
          head.value?.speakEmoji(message.text);
        }
        break;
      case "closeMusic":
        pauseMusic();
        break;
      case "modelAction":
        head.value?.playAnimation(message.text);
        break;
    }
  }
  //处理消息
  async function handleTextMessage(message: any) {
    let words = message.words || [];
    // console.log(words);
    let audio = {
      audio: base64ToArrayBuffer(message.data),
      words: [] as string[],
      wtimes: [] as number[],
      wdurations: [] as number[],
    };
    console.log(words);
    words.forEach((x: any) => {
      audio.words.push(x.word);
      audio.wtimes.push(x.start_time);
      audio.wdurations.push(x.end_time - x.start_time);
    });
    bufferQueue.push(audio);
    isSpeaker.value = true;
    playAudio();
  }
  async function playAudio() {
    if (bufferQueue.length === 0 || state.isStreaming) return;
    let audio = bufferQueue.shift();
    await head.value?.streamStart(
      { sampleRate: 16000, lipsyncType: "words", gain: 3, lipsyncLang: "en" },
      () => (state.isStreaming = true),
      () => {
        state.isStreaming = false;
        if (bufferQueue.length > 0) {
          playAudio();
        } else {
          isSpeaker.value = false;
        }
      },
    );
    head.value?.streamAudio(audio);
    // head.value.streamNotifyEnd();
  }

  function sendMessage(data: sendMsgType) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data));
    }
  }
  async function startRecording() {
    if (state.isRecording || !head.value) return;
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    await continueStartRecording();
  }
  async function continueStartRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: CHANNELS,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      // 检查流是否有效
      if (!stream.active) throw new Error("音频流无效");
      mediaStream = stream;
      mediaSource = audioContext.createMediaStreamSource(stream);
      const processor = await createAudioProcessor();
      if (!processor) throw new Error("创建音频处理器失败");
      audioProcessor = processor;
      mediaSource.connect(audioProcessor);
      audioProcessor?.connect(audioContext.destination);

      startBufferSender(); // 启动缓冲发送
      state.isRecording = true;
    } catch (error) {
      console.error("获取麦克风权限失败:", error);
    }
  }
  async function createAudioProcessor() {
    await audioContextMusic.suspend();
    try {
      // 尝试使用更现代的AudioWorklet API
      if ("AudioWorklet" in window && "AudioWorkletNode" in window) {
        const url = "/script/recorder-processor.js";
        // 加载AudioWorklet模块
        await audioContext.audioWorklet.addModule(url);
        // 创建AudioWorkletNode
        const workletNode = new AudioWorkletNode(audioContext, "opus-recorder-processor");
        // 处理从AudioWorklet接收的消息
        workletNode.port.onmessage = event => {
          if (event.data.buffer) {
            // 使用与ScriptProcessor相同的处理逻辑
            const pcmBuffer = float32ToInt16PCM(event.data.buffer);
            enqueueBuffer(pcmBuffer); // 放入缓冲队列
          }
        };
        // 启动录音
        workletNode.port.postMessage({ command: "start" });
        // 保存停止函数
        (workletNode as any).stopRecording = () => {
          workletNode.port.postMessage({ command: "stop" });
        };
        return workletNode;
      }
    } catch (error) {
      console.error("创建AudioWorklet失败，将使用ScriptProcessor:", error);
      return null;
    }
    return null;
  }
  /** 启动缓冲发送定时器 */
  function startBufferSender() {
    bufferTimer = window.setInterval(() => {
      if (sendBuffer.length > 0) {
        flushBuffer();
      }
    }, BUFFER_SEND_INTERVAL);
  }
  /** 将数据放入发送缓冲队列 */
  function enqueueBuffer(chunk: ArrayBuffer) {
    sendBuffer.push(chunk);
    if (sendBuffer.length >= BUFFER_MAX_CHUNKS) {
      flushBuffer();
    }
  }
  /** 发送并清空缓冲 */
  function flushBuffer() {
    if (sendBuffer.length === 0) return;
    const merged = mergeArrayBuffers(sendBuffer);
    sendMessage({ type: "audio", data: arrayBufferToBase64(merged) });
    sendBuffer = [];
  }
  // 停止录音
  async function stopRecording() {
    if (!state.isRecording) return;
    try {
      mediaStream?.getTracks().forEach((track: any) => track.stop());
      audioProcessor?.disconnect();
      mediaSource?.disconnect();
      await audioContext?.close();
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error("停止录音失败:", error);
    }

    if (bufferTimer) {
      clearInterval(bufferTimer);
      bufferTimer = null;
    }
    flushBuffer();
    if (state.isConnected) sendMessage({ type: "end" });
    state.isRecording = false;
    await audioContextMusic.resume();
  }
  watch(
    () => route.params.id,
    async id => {
      ws.value?.close();
      await useTalkieStore().getChatting(id as string);
      if (avatarref?.value) initHead();
      connectWebSocket();
    },
  );
  // 关闭
  const close = () => {
    try {
      ws.value?.close();
      audioContextMusic?.close();
      sourceNode?.disconnect();
      audioContext?.close();
      mediaStream?.getTracks().forEach((track: any) => track.stop());
      mediaStream = null;
      audioProcessor?.disconnect();
      mediaSource?.disconnect();
      audioProcessor = null;
      mediaSource = null;
      bufferTimer = null;
      sendBuffer = [];
      stopHeartbeat();
    } catch (error) {
      console.error("关闭连接失败:", error);
    }
  };
  onMounted(async () => {
    await NewHead();
    await useTalkieStore().getChatting(route.params.id as string);
    if (avatarref?.value) initHead();
    connectWebSocket();
  });
  onUnmounted(() => {
    close();
  });
  return {
    wsMsg,
    loading,
    isSpeaker,
    sendMessage,
    startRecording,
    stopRecording,
    close,
  };
}
/** Float32 → Int16 PCM */
function float32ToInt16PCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2); // 每个样本 2 字节
  const view = new DataView(buffer);

  for (let i = 0; i < float32Array.length; i++) {
    let sample = Math.max(-1, Math.min(1, float32Array[i])); // 限幅
    // Float32 [-1,1] -> Int16 [-32768,32767]
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(i * 2, int16, true); // 小端
  }

  return buffer;
}
/** 合并多个 ArrayBuffer */
function mergeArrayBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return result.buffer;
}
// 将Base64编码的音频数据转换为ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64); // 解码 Base64 成 binary 字符串
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i); // 转成字节
  }

  return bytes.buffer; // 返回 ArrayBuffer
}
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary); // 转 base64
}
