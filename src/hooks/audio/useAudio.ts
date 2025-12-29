const SAMPLE_RATE = 16000;
const BUFFER_SEND_INTERVAL = 100; // 每100ms发送一次
const HEARTBEAT_INTERVAL = 30000; // 心跳间隔 30s

export function useAudio(avatarRef: Ref<HTMLDivElement | null>) {
  const router = useRouter();
  const route = useRoute();
  const { chattingAi } = storeToRefs(useTalkieStore());
  const { token } = storeToRefs(useUserStore());

  const music = new Music();
  const worker = new Worker(new URL("@/worker/encode/worker.js", import.meta.url));
  let bufferQueue: any[] = [];
  let sendBuffer: ArrayBuffer[] = [];
  let ws: WebSocket | null = null;
  let heartbeatTimer: any = null;
  let bufferTimer: any = null;
  // 录音相关变量
  let audioContext: AudioContext = new (window.AudioContext || window.webkitAudioContext)();
  let mediaStream: MediaStream | null = null;
  let mediaSource: MediaStreamAudioSourceNode | null = null;
  let audioProcessor: AudioWorkletNode | null = null;
  // 响应式变量
  const head = shallowRef<any>(null); // 3D模型使用 shallowRef
  const isStreaming = ref(false);
  const loading = ref(true);
  const isRecording = ref(false);
  const modelUrl = ref("");
  const isSpeaker = ref(false); // 说话人是否可以说话
  const wsMsg = ref<any>({});
  const isXModel = ref(false);
  let startTime = 0;

  // --- 3. [核心] WASM 解密逻辑 ---
  const initWorker = () => {
    worker.onmessage = e => {
      const { type, success, result, error } = e.data;
      if (type === "init") {
        console.log(success ? "WASM 初始化成功" : "WASM 初始化失败", error || "");
      } else if (type === "decrypt") {
        if (error) {
          ElMessage.error("模型解密失败");
        } else {
          // 释放旧的 Blob URL 释放内存
          if (modelUrl.value.startsWith("blob:")) URL.revokeObjectURL(modelUrl.value);
          const blob = new Blob([result], { type: "model/gltf-binary" });
          modelUrl.value = URL.createObjectURL(blob);
        }
      }
    };
    worker.postMessage({ type: "init" });
  };

  const getDecode = async (url: string, decrypt = true) => {
    if (!decrypt) return (modelUrl.value = url);
    try {
      const resp = await fetch(url);
      const arrayBuffer = await resp.arrayBuffer();
      // 注意：uint8ToBase64 是大负担操作，如果 Worker 支持，建议直接 postMessage(arrayBuffer, [arrayBuffer])
      const encrypted = uint8ToBase64(new Uint8Array(arrayBuffer));
      worker.postMessage({ type: "decrypt", data: encrypted });
    } catch (e) {
      console.error("下载模型失败", e);
    }
  };
  // websocket
  const connectWebSocket = () => {
    const url = `${import.meta.env.VITE_WEBSOCKET}/api/ws?token=${token.value}`;
    ws = new WebSocket(url);
    ws.onopen = () => {
      sendWsMessage({ type: "sub", data: route.params.id as string });
      startHeartbeat();
    };
    ws.onmessage = e => {
      if (typeof e.data === "string") {
        if (e.data.includes("身份认证")) return;
        if (e.data.includes("新设备")) {
          token.value = "";
          ElMessageBox.alert($at("新设备登录"), $at("请重新登录")).then(() => {
            router.push("/login");
          });
        }
        const msg = JSON.parse(e.data);
        handleWsJsonMessage(msg);
      } else {
        music.play(e.data);
      }
    };
    ws.onclose = () => stopHeartbeat();
    ws.onerror = () => ElMessage.error("连接中断");
  };
  const handleWsJsonMessage = (msg: any) => {
    switch (msg.type) {
      case "user":
        wsMsg.value = {
          ID: new Date().getTime(),
          role: "user",
          content: msg.text,
        };
        break;
      case "audio":
        if (msg.text !== "end") {
          wsMsg.value = {
            ID: new Date().getTime(),
            role: "assistant",
            content: msg.text,
          };
          const audioData = {
            audio: base64ToArrayBuffer(msg.data),
            words: msg.words?.map((x: any) => x.word) || [],
            wtimes: msg.words?.map((x: any) => x.start_time) || [],
            wdurations: msg.words?.map((x: any) => x.end_time - x.start_time) || [],
          };
          bufferQueue.push(audioData);
          checkAndPlayNext();
        }
        break;
      case "closeMusic":
        music.pauseMusic();
        break;
      case "modelAction":
        head.value.setAction(msg.text);
        break;
    }
  };
  const checkAndPlayNext = async () => {
    if (isStreaming.value || bufferQueue.length === 0) return;
    const currAudio = bufferQueue.shift();
    try {
      await head.value?.streamStart(
        { sampleRate: SAMPLE_RATE, gain: 3 },
        () => (isStreaming.value = true),
        () => {
          isStreaming.value = false;
          if (bufferQueue.length > 0) {
            checkAndPlayNext();
          } else {
            isSpeaker.value = false;
          }
        },
      );
      head.value?.streamAudio(currAudio);
    } catch (error) {
      isStreaming.value = false;
    }
  };
  // 录音采集
  async function startRecording() {
    if (isRecording.value) return;
    try {
      audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await audioContext.audioWorklet.addModule("/script/recorder-processor.js");
      audioProcessor = new AudioWorkletNode(audioContext, "opus-recorder-processor");
      mediaSource = audioContext.createMediaStreamSource(mediaStream);
      mediaSource.connect(audioProcessor);

      audioProcessor.port.onmessage = e => {
        if (e.data.buffer) enqueueBuffer(float32ToInt16PCM(e.data.buffer));
      };
      // 启动录音
      audioProcessor.port.postMessage({ command: "start" });
      await music.pauseContext();
      isRecording.value = true;
      startTime = Date.now();
      bufferTimer = setInterval(flushBuffer, BUFFER_SEND_INTERVAL);
    } catch (error) {
      ElMessage.error("录音失败");
    }
  }
  const stopRecording = () => {
    if (!isRecording.value) return;
    isRecording.value = false;
    audioProcessor?.disconnect();
    mediaStream?.getTracks().forEach(t => t.stop());
    audioContext.close();

    clearInterval(bufferTimer);
    flushBuffer();
    sendWsMessage({ type: "end" });
    music.resumeContext();
  };
  const sendWsMessage = (data: any) => {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
  };
  const enqueueBuffer = (chunk: ArrayBuffer) => {
    sendBuffer.push(chunk);
    if (sendBuffer.length >= 5) flushBuffer();
  };
  const flushBuffer = () => {
    if (sendBuffer.length === 0) return;
    const merged = mergeArrayBuffers(sendBuffer);
    sendWsMessage({ type: "audio", data: arrayBufferToBase64(merged) });
    sendBuffer = [];
  };
  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => sendWsMessage({ type: "ping" }), HEARTBEAT_INTERVAL);
  };

  const stopHeartbeat = () => {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  };
  // --- 渲染器初始化 ---
  const initHead = async () => {
    if (!avatarRef.value || !modelUrl.value) return;
    const opt = {
      url: modelUrl.value,
      isXModel: isXModel.value,
    };
    const render = new ModelRender(avatarRef.value, opt);
    await render.showModel(e => {
      if (e.loaded === e.total) {
        setTimeout(() => {
          loading.value = false;
        }, 2000);
      }
    });
    head.value = render;
  };
  // --- 生命周期 ---
  onMounted(async () => {
    initWorker();
    if (route.params.id) {
      await useTalkieStore().getChatting();
      connectWebSocket();
    }
  });
  onUnmounted(() => {
    worker.terminate();
    ws?.close();
    worker.terminate();
    music.close();
    if (modelUrl.value.startsWith("blob:")) URL.revokeObjectURL(modelUrl.value);
    chattingAi.value = {};
    head.value?.clone();
    console.log(123);
  });
  // --- 监听 ---
  watch(
    () => chattingAi.value?.model_url,
    val => {
      if (!val) return;
      isXModel.value = val.includes("_X");
      getDecode(val, false);
    },
    { immediate: true },
  );
  watch(modelUrl, () => {
    if (!modelUrl.value) return;
    initHead();
  });
  return {
    isRecording,
    loading,
    isStreaming,
    wsMsg,
    isSpeaker,
    sendWsMessage,
    startRecording,
    stopRecording,
    // 这里的格式化时间建议用 computed 处理
    formattedTime: computed(() => {
      /* 基于 timer 的格式化逻辑 */
      return "00:00";
    }),
  };
}
