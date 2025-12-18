import { eq, get } from "lodash";

// 审核管理
export const useAuditStore = defineStore("audit", () => {
  const auditList = ref<any[]>([]);
  const audittotal = ref(0);
  const auditDetail = ref<any>({});
  const characterList = ref<any[]>([]);
  const charactertotal = ref(0);
  const page_index = ref(1);
  const page_count = ref(10);
  async function GetAuditList(status: string) {
    try {
      const res = await getAuditModelList({
        page_index: page_index.value,
        page_count: page_count.value,
        status: status,
      });
      if (eq(res.code, 0)) {
        auditList.value = get(res, "data.list", []);
        audittotal.value = get(res, "data.total", 0);
      }
    } catch (error) {
      console.log(error);
    }
  }
  // 获取人物列表
  async function GetCharacterList() {
    try {
      const res = await getCharacterList({
        page_index: page_index.value,
        page_count: page_count.value,
      });
      if (eq(res.code, 0)) {
        characterList.value = get(res, "data.list", []);
        charactertotal.value = get(res, "data.total", 0);
      }
    } catch (error) {
      console.log(error);
    }
  }
  // 获取审核详情
  async function GetAuditDetail(id: number) {
    try {
      const res = await getAuditDetail(id);
      console.log(res);
      if (eq(res.code, 0)) {
        auditDetail.value = get(res, "data", {});
      }
    } catch (error) {
      console.log(error);
    }
  }
  return {
    auditList,
    audittotal,
    auditDetail,
    characterList,
    charactertotal,
    GetAuditList,
    GetAuditDetail,
    GetCharacterList,
  };
});
// 音色管理
export const useVoiceStore = defineStore("voice", () => {
  const voiceList = ref<any[]>([]);
  const userVoiceList = ref<any[]>([]);
  const status = ref("active");
  // 获取音色列表
  async function getVoice(params: VoiceParams) {
    try {
      const res = await getVoiceList(params);
      if (eq(res.code, 0)) {
        voiceList.value = get(res, "data.list", []);
      }
    } catch (error) {
      console.log(error);
    }
  }
  watch(status, async newStatus => {
    await getUserVoice();
  });
  // 获取用户音色列表
  async function getUserVoice() {
    try {
      const res = await getUserVoiceList({
        page_index: 1,
        page_count: 50,
        status: status.value,
      });
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
      if (eq(res.code, 0)) {
        ElMessage.success("克隆成功");
        getUserVoice();
        return true;
      }
      ElMessage.error("克隆失败");
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  return {
    voiceList,
    userVoiceList,
    getVoice,
    getUserVoice,
    clone,
    status,
  };
});

// config
export const useCreationStore = defineStore("creation", () => {
  const isMobileMenuOpen = ref(false); // 控制手机端菜单开关
  return {
    isMobileMenuOpen,
  };
});
