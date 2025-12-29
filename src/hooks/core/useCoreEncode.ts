export const useCoreEncode = () => {
  const worker = new Worker(new URL("@/worker/encode/worker.js", import.meta.url));
  const blobUrl = ref("");
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
          if (blobUrl.value.startsWith("blob:")) URL.revokeObjectURL(blobUrl.value);
          const blob = new Blob([result], { type: "model/gltf-binary" });
          blobUrl.value = URL.createObjectURL(blob);
        }
      }
    };
    worker.postMessage({ type: "init" });
  };
  const getDecode = async (url: string, decrypt = true) => {
    if (!decrypt) return (blobUrl.value = url);
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
  onUnmounted(() => {
    if (blobUrl.value.startsWith("blob:")) URL.revokeObjectURL(blobUrl.value);
    worker.terminate();
  });
  return {
    blobUrl,
    initWorker,
    getDecode,
  };
};
