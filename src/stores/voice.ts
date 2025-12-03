import { eq, get } from "lodash";

export const useVoiceStore = defineStore("voice", () => {
  const voiceList = ref<any[]>([]);
  // 获取音色列表
  async function getVoice(params: VoiceParams) {
    try {
      const res = await getVoiceList(params);
      console.log(res);
      if (eq(res.code, 0)) {
        voiceList.value = get(res, "data.list", []);
      }
    } catch (error) {
      console.log(error);
    }
  }
  // 试听音色
  async function preview(data: previewVoiceParams) {
    try {
      const res = await previewVoice(data);
      console.log(res);
      if (eq(res.code, 0)) {
        const audio = get(res, "data.audio", "");
        playPCM(audio);
      }
    } catch (error) {
      console.log(error);
    }
  }
  return {
    voiceList,
    getVoice,
    preview,
  };
});
