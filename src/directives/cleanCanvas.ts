export default {
  mounted(el: any) {
    const clean = () => {
      const canvases = el.querySelectorAll("canvas");
      if (canvases.length > 1) {
        for (let i = 0; i < canvases.length - 1; i++) {
          canvases[i].remove();
        }
      }
    };

    // 初始化时清理一次
    clean();

    // 监听 DOM 变化
    const observer = new MutationObserver(() => {
      clean();
    });

    observer.observe(el, { childList: true });

    // 保存 observer，卸载时用
    el._canvasObserver = observer;
  },
  unmounted(el: any) {
    if (el._canvasObserver) {
      el._canvasObserver.disconnect();
      delete el._canvasObserver;
    }
  },
};
