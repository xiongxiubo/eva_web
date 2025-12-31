import { RIGRender } from "../renderUtils/RIGRender";

export function useCoreRunder() {
  const { auditDetail } = storeToRefs(useAuditStore());
  const isHeadLoading = ref(true);
  const head = shallowRef<ModelRender | RIGRender | null>(null);
  const isStreaming = ref(false);
  const isSpeaker = ref(false);
  let bufferQueue: any[] = [];

  const NewModelRender = async (avatar: HTMLDivElement, opt: any) => {
    const render = auditDetail.value?.action === "RIG" ? new RIGRender(avatar, opt) : new ModelRender(avatar, opt);
    head.value = render;
  };
  const initHead = async () => {
    await head.value?.showModel(e => {
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
