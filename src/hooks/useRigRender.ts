export const useRigRender = (div: Ref<HTMLElement | null>) => {
  const head = shallowRef<RigRender | null>(null);
  const initHead = async () => {
    if (!div.value) return;
    const rigRender = new RigRender(div.value);
    await rigRender.showModel("/model/test.fbx");
    head.value = rigRender;
  };
  onMounted(async () => {
    await initHead();
  });
  return head;
};
