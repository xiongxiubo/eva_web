import { eq, get } from "lodash";

export const useAuditStore = defineStore("audit", () => {
  const auditList = ref<any[]>([]);
  const audittotal = ref(0);
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
  return {
    auditList,
    audittotal,
    characterList,
    charactertotal,
    GetAuditList,
    GetCharacterList,
  };
});
