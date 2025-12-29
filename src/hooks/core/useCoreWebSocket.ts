export function useCoreWebSocket() {
  const { token } = storeToRefs(useUserStore());
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const isWsLoading = ref(false);
  const msg = ref<string | ArrayBuffer | Blob>();

  let heartbeatTimer: any = null;

  const connect = (id: string) => {
    isWsLoading.value = true;
    ws.value = new WebSocket(`${import.meta.env.VITE_WEBSOCKET}/api/ws?token=${token.value}`);
    ws.value.onopen = () => {
      sendWsMessage({ type: "sub", data: String(id) });
      isConnected.value = true;
      isWsLoading.value = false;
      startHeartbeat();
    };
    ws.value.onmessage = e => {
      msg.value = e.data;
    };
    ws.value.onclose = () => {
      isConnected.value = false;
      isWsLoading.value = false;
      stopHeartbeat();
    };
    ws.value.onerror = () => {
      isConnected.value = false;
      isWsLoading.value = false;
      stopHeartbeat();
    };
  };
  const sendWsMessage = (data: any) => {
    if (ws.value?.readyState === WebSocket.OPEN) ws.value.send(JSON.stringify(data));
  };
  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => sendWsMessage({ type: "ping" }), 30000);
  };
  const stopHeartbeat = () => {
    if (!heartbeatTimer) return;
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  };
  const clone = () => {
    if (!ws.value) return;
    ws.value?.close();
    isConnected.value = false;
    isWsLoading.value = false;
    stopHeartbeat();
  };
  onUnmounted(() => {
    clone();
  });
  return {
    connect,
    sendWsMessage,
    isConnected,
    isWsLoading,
    msg,
    clone,
  };
}
