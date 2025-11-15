import { getChattingAi, getRoleList, getTagList } from "@/api";
import { eq, get } from "lodash";

export const useTalkieStore = defineStore("talkie", () => {
  const talkieList = ref<any[]>([]);
  const tagList = ref<any[]>([]);
  const chattingAi = ref<any>({});
  const chatHistory = ref<any[]>([]);
  const page = ref<number>(1);
  const route = useRoute();

  async function getTag() {
    try {
      const res = await getTagList();
      if (eq(res.code, 0)) {
        const list = get(res, "data.list", []);
        tagList.value = list.sort((a: any, b: any) => a.id - b.id);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function getTalkie({ page_index = 1, page_count = 10, tags_type = "" }) {
    try {
      const res = await getRoleList({
        page_index,
        page_count,
        tags_type,
      });
      if (eq(res.code, 0)) {
        talkieList.value = get(res, "data.list", []);
      }
    } catch (error) {
      console.log(error);
    }
  }
  // 获取正在聊的ai
  async function getChatting() {
    try {
      const res = await getChattingAi(route.params.id as string);
      if (eq(res.code, 0)) {
        chattingAi.value = get(res, "data", {});
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function getHistory() {
    try {
      const res = await getChatData({
        page_index: page.value,
        page_count: 50,
        talkie_id: route.params.id as string,
      });
      if (eq(res.code, 0)) {
        const list = get(res, "data.list", [])
          .filter((item: any) => item.role !== "tool")
          .filter((item: any) => item.content !== "");
        page.value === 1 ? (chatHistory.value = list) : (chatHistory.value = [...chatHistory.value, ...list]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return {
    tagList,
    talkieList,
    chattingAi,
    chatHistory,
    page,
    getTag,
    getTalkie,
    getChatting,
    getHistory,
  };
});
