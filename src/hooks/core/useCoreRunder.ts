export function useCoreRunder() {
  const isHeadLoading = ref(true);
  const head = shallowRef<ModelRender | null>(null);
  const isStreaming = ref(false);
  const isSpeaker = ref(false);
  let bufferQueue: any[] = [];

  const NewModelRender = async (avatar: HTMLDivElement) => {
    const render = new ModelRender(avatar);
    head.value = render;
  };
  const initHead = async (url: string) => {
    await head.value?.showModel({ url }, e => {
      if (e.loaded === e.total) {
        setTimeout(() => {
          isHeadLoading.value = false;
        }, 2000);
      }
    });
  };
  const handleWsJsonMessage = (msg: any) => {
    switch (msg.type) {
      case "audio":
        if (msg.text !== "end") {
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
    }
  };
  const checkAndPlayNext = async () => {
    if (isStreaming.value || bufferQueue.length === 0) return;
    const currAudio = bufferQueue.shift();
    isSpeaker.value = true;
    try {
      await head.value?.streamStart(
        { sampleRate: 16000, gain: 3 },
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
      console.log(error);
      isStreaming.value = false;
    }
  };
  return {
    isHeadLoading,
    head,
    initHead,
    handleWsJsonMessage,
    isSpeaker,
    NewModelRender,
  };
}
