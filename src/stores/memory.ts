import { eq } from "lodash";

export const useMemoryStore = defineStore("memory", () => {
  const MemoryList = ref<any[]>([]);

  async function GetMemory() {
    const res = await getMemoryList();
    if (eq(res.code, 0)) {
      MemoryList.value = res.data;
    }
  }
  return {
    MemoryList,
    GetMemory,
  };
});
