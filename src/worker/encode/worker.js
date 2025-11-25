// worker.js
let go;
let wasmReady = false;

self.onmessage = async e => {
  const { type, data } = e.data;

  if (type === "init") {
    try {
      importScripts("./wasm_exec.js");
      go = new Go();
      const result = await WebAssembly.instantiateStreaming(fetch("./main.wasm"), go.importObject);
      go.run(result.instance);
      wasmReady = true;
      self.postMessage({ type: "init", success: true });
    } catch (err) {
      self.postMessage({ type: "init", success: false, error: err.toString() });
    }
    return;
  }

  if (type === "decrypt") {
    if (!wasmReady) {
      self.postMessage({ type: "decrypt", error: "wasm not ready" });
      return;
    }
    try {
      const ret = self.decryptWithPublicKey(data); // 传字符串
      self.postMessage({ type: "decrypt", result: ret });
    } catch (err) {
      console.log(err);
      self.postMessage({ type: "decrypt", error: err.toString() });
    }
  }
};
