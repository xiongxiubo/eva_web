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

export function useAudio(avatarRef: any) {
  const route = useRoute();
  const head = shallowRef<MixamoRender | null>(null);
  const isStreaming = ref(false);
  const loading = ref(true);
  const isSpeaker = ref(false); // 说话人是否可以说话
  let decodeTimer: number | null = null;
  let headInitTimer: number | null = null;

  const { chattingAi } = storeToRefs(useTalkieStore());
  const { modelUrl, getDecode, initWorker } = useEncodeWorker();
  const { closeMusic, playMusic, pauseMusic, audioContextMusic } = useBgMusic();
  const { connectWebSocket, sendMessage, closeWebSocket, wsMsg, bufferQueue } = useWebSocket(playMusic, pauseMusic);
  const { startRecording, stopRecording, recordClose, formattedTime } = useRecordAudio(sendMessage, audioContextMusic);

  async function NewHead() {
    if (!avatarRef.value) return;
    const render = new MixamoRender(avatarRef.value);
    await render.showModel({ url: modelUrl.value }, (e: any) => {
      if (e.loaded === e.total) {
        setTimeout(() => {
          loading.value = false;
        }, 2000);
      }
    });
    head.value = render;
  }
  async function playAudio() {
    if (bufferQueue.value.length === 0 || isStreaming.value) return;
    let audio = bufferQueue.value.shift();
    await head.value?.streamStart(
      { sampleRate: 16000, lipsyncType: "words", gain: 3, lipsyncLang: "en" },
      () => (isStreaming.value = true),
      () => {
        isStreaming.value = false;
        if (bufferQueue.value.length > 0) {
          playAudio();
        } else {
          isSpeaker.value = false;
        }
      },
    );
    head.value?.streamAudio(audio);
  }
  // 关闭
  const close = () => {
    try {
      closeMusic();
      recordClose();
      closeWebSocket();
      chattingAi.value = {};
    } catch (error) {
      console.error("关闭连接失败:", error);
    }
  };
  watch(
    () => bufferQueue.value.length,
    async len => {
      if (len > 0 && !isStreaming.value) await playAudio();
    },
  );
  watch(
    () => route.params.id,
    async (id, oldId) => {
      if (id === oldId) return;
      closeWebSocket();
      await useTalkieStore().getChatting();
      connectWebSocket();
    },
  );
  watch(
    () => chattingAi.value?.model_3d,
    (newUrl, oldUrl) => {
      if (!newUrl || newUrl === oldUrl) return;
      if (decodeTimer) clearTimeout(decodeTimer);
      decodeTimer = window.setTimeout(() => {
        getDecode(newUrl);
      }, 200); // 防抖 200ms
    },
  );
  watch(modelUrl, (newUrl, oldUrl) => {
    if (!newUrl || newUrl === oldUrl) return;
    if (headInitTimer) clearTimeout(headInitTimer);
    headInitTimer = window.setTimeout(() => {
      NewHead();
    }, 200);
  });
  onMounted(async () => {
    initWorker();
    await useTalkieStore().getChatting();
    connectWebSocket();
  });
  onUnmounted(() => {
    close();
  });
  return {
    wsMsg,
    loading,
    isSpeaker,
    formattedTime,
    sendMessage,
    startRecording,
    stopRecording,
    close,
  };
}
// 解密线程
function useEncodeWorker() {
  const worker = new Worker(new URL("@/worker/encode/worker.js", import.meta.url));
  const modelUrl = ref<string>("");

  const initWorker = () => {
    worker.onmessage = e => {
      const { type, success, result, error } = e.data;
      if (type === "init") {
        success ? console.log("WASM init success") : console.log("WASM init error", error);
        return;
      }
      if (type === "decrypt") {
        if (error) {
          console.error("解密失败:", error);
        } else {
          const blob = new Blob([result], { type: "model/gltf-binary" });
          modelUrl.value = URL.createObjectURL(blob);
        }
      }
    };
    worker.postMessage({ type: "init" });
  };
  const getDecode = async (url: string, decrypt = true) => {
    if (!decrypt) return (modelUrl.value = url);
    const resp = await fetch(url);
    const arrayBuffer = await resp.arrayBuffer();
    const encrypted = uint8ToBase64(new Uint8Array(arrayBuffer));
    worker?.postMessage({ type: "decrypt", data: encrypted });
  };
  return {
    modelUrl,
    getDecode,
    initWorker,
  };
}
// 背景音乐
function useBgMusic() {
  //音乐上下文
  let audioContextMusic: AudioContext = new (window.AudioContext || window.webkitAudioContext)();
  let sourceNode: AudioBufferSourceNode | null = null;
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
  function closeMusic() {
    audioContextMusic?.close();
    sourceNode?.disconnect();
  }
  return {
    playMusic,
    pauseMusic,
    audioContextMusic,
    closeMusic,
  };
}
// 连接webdocket
function useWebSocket(playMusic: (arrayBuffer: ArrayBuffer | Blob) => Promise<void>, pauseMusic: () => void) {
  const router = useRouter();
  const route = useRoute();
  const { token } = storeToRefs(useUserStore());
  const isConnected = ref<boolean>(false);
  const ws = ref<WebSocket | null>(null);
  const wsMsg = ref<any>();
  const bufferQueue = ref<any[]>([]);

  // 连接websocket
  function connectWebSocket() {
    ws.value = new WebSocket(`${import.meta.env.VITE_WEBSOCKET}/api/ws?token=${token.value}`);
    ws.value.onopen = () => {
      isConnected.value = true;
      sendMessage({
        type: "sub",
        data: route.params.id as string,
      });
      startHeartbeat();
    };
    ws.value.onclose = () => {
      isConnected.value = false;
      stopHeartbeat();
    };
    ws.value.onerror = () => {
      ElMessage.error("WebSocket连接错误");
      isConnected.value = false;
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
      case "closeMusic":
        pauseMusic();
        break;
    }
  }
  //处理消息
  async function handleTextMessage(message: any) {
    let words = message.words || [];
    let audio = {
      audio: base64ToArrayBuffer(message.data),
      words: [] as string[],
      wtimes: [] as number[],
      wdurations: [] as number[],
    };
    words.forEach((x: any) => {
      audio.words.push(x.word);
      audio.wtimes.push(x.start_time);
      audio.wdurations.push(x.end_time - x.start_time);
    });
    bufferQueue.value.push(audio);
    console.log(bufferQueue.value);
  }
  function sendMessage(data: sendMsgType) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data));
    }
  }
  function closeWebSocket() {
    ws.value?.close();
    stopHeartbeat();
  }
  return {
    isConnected,
    wsMsg,
    bufferQueue,
    sendMessage,
    connectWebSocket,
    closeWebSocket,
  };
}
// 采集音频
function useRecordAudio(sendMessage: (data: sendMsgType) => void, audioContextMusic: AudioContext) {
  // 音频上下文
  let audioContext: AudioContext = new (window.AudioContext || window.webkitAudioContext)();
  let mediaStream: MediaStream | null = null;
  let mediaSource: MediaStreamAudioSourceNode | null = null;
  let audioProcessor: AudioWorkletNode | null = null;
  const isRecording = ref<boolean>(false);

  const start_time = ref(0);
  const timer = ref(0);
  const timerInterval = ref<any>(null);

  const sendBuffer = ref<ArrayBuffer[]>([]); // 发送缓冲区
  let bufferTimer: number | null = null; // 发送定时器

  async function startRecording() {
    if (isRecording.value) return;
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
      isRecording.value = true;
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
        const workletNode = new AudioWorkletNode(audioContext, "opus-recorder-processor", {
          processorOptions: {
            sampleRate: 16000,
          },
        });
        // 处理从AudioWorklet接收的消息
        workletNode.port.onmessage = event => {
          if (event.data.buffer) {
            const pcmBuffer = float32ToInt16PCM(event.data.buffer);
            enqueueBuffer(pcmBuffer); // 放入缓冲队列
          }
        };
        // 启动录音
        workletNode.port.postMessage({ command: "start" });
        start_time.value = Date.now();
        timer.value = 0;
        timerInterval.value = window.setInterval(updateTimer, 500);
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
      if (sendBuffer.value.length > 0) {
        flushBuffer();
      }
    }, BUFFER_SEND_INTERVAL);
  }
  /** 将数据放入发送缓冲队列 */
  function enqueueBuffer(chunk: ArrayBuffer) {
    sendBuffer.value.push(chunk);
    if (sendBuffer.value.length >= BUFFER_MAX_CHUNKS) {
      flushBuffer();
    }
  }
  /** 发送并清空缓冲 */
  function flushBuffer() {
    if (sendBuffer.value.length === 0) return;
    const merged = mergeArrayBuffers(sendBuffer.value);
    sendMessage({ type: "audio", data: arrayBufferToBase64(merged) });
    sendBuffer.value = [];
  }
  // 停止录音
  async function stopRecording() {
    if (!isRecording.value) return;
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
    sendMessage({ type: "end" });
    isRecording.value = false;
    await audioContextMusic.resume();
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
      timer.value = 0;
    }
  }
  // 格式化录音时间
  const formattedTime = computed(() => {
    const total = Math.floor(timer.value);
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
  });
  const updateTimer = () => {
    if (start_time.value) timer.value = (Date.now() - start_time.value) / 1000;
  };
  function recordClose() {
    bufferTimer = null;
    sendBuffer.value = [];
    audioContext?.close();
    mediaStream?.getTracks().forEach((track: any) => track.stop());
    mediaStream = null;
    audioProcessor?.disconnect();
    mediaSource?.disconnect();
    audioProcessor = null;
    mediaSource = null;
  }
  return {
    startRecording,
    stopRecording,
    recordClose,
    formattedTime,
  };
}
