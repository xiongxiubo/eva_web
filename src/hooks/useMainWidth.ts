export function useMainWidth() {
  const width = ref(0);
  let observer: ResizeObserver | null = null;

  onMounted(() => {
    const main = document.querySelector("main");
    if (main) {
      width.value = main.clientWidth;
      observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          width.value = entry.contentRect.width;
        }
      });
      observer.observe(main);
    }
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

  return { width };
}
