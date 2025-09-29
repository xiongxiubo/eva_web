export const useDevice = () => {
  const width = ref(window.innerWidth);

  const update = () => {
    width.value = window.innerWidth;
  };
  const isMobile = computed(() => width.value <= 768);
  onMounted(() => window.addEventListener("resize", update));
  onUnmounted(() => window.removeEventListener("resize", update));
  return { isMobile };
};
