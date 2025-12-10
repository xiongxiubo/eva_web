import { eq, get } from "lodash";

export const useVoiceStore = defineStore("voice", () => {
  const voiceList = ref<any[]>([]);
  const userVoiceList = ref<any[]>([]);
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
  // 获取用户音色列表
  async function getUserVoice() {
    try {
      const res = await getUserVoiceList({
        page_index: 1,
        page_count: 50,
      });
      console.log(res);
      if (eq(res.code, 0)) {
        userVoiceList.value = get(res, "data.list", []);
      }
    } catch (error) {
      console.log(error);
    }
  }
  // 克隆音色
  async function clone(data: FormData) {
    try {
      const res = await cloneVoice(data);
      console.log(res);
      if (eq(res.code, 0)) {
        ElMessage.success("克隆成功");
        getUserVoice();
      } else {
        ElMessage.error("克隆失败");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return {
    voiceList,
    userVoiceList,
    getVoice,
    preview,
    getUserVoice,
    clone,
  };
});
