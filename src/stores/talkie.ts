import { getChattingAi, getRoleList, getTagList } from "@/api";
import { debounce, eq, get } from "lodash";

export const useTalkieStore = defineStore("talkie", () => {
  const talkieList = ref<any[]>([]);
  const tagList = ref<any[]>([]);
  const chattingAi = ref<any>({});
  const chatHistory = ref<any[]>([]);
  const chatHistoryTotal = ref<number>(0);
  const page = ref<number>(1);
  const gender = ref<string>("all");
  const language = ref<string>("all");
  const tags_type = ref<string>("ALL");
  const route = useRoute();
  const router = useRouter();
  const isPrivate = ref<boolean>(false);
  const loading = ref<boolean>(true);
  const keyword = ref<string>("");

  async function getAiPrivate() {
    try {
      loading.value = true;
      const res = await getPrivateRoleList({
        page_index: 1,
        page_count: 20,
        tags_type: tags_type.value,
        gender: gender.value,
        language: language.value,
        keyword: keyword.value,
      });
      if (eq(res.code, 0)) {
        const list = get(res, "data.list", []);
        talkieList.value = list.sort((a: any, b: any) => a.id - b.id);
      }
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  }

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

  const debounceGetTalkie = debounce(() => getTalkie(), 500);
  const debounceGetAiPrivate = debounce(() => getAiPrivate(), 500);
  watch(isPrivate, () => {
    tags_type.value = "ALL";
    keyword.value = "";
    gender.value = "all";
    language.value = "all";
  });
  watch(
    () => [gender.value, language.value, tags_type.value, isPrivate.value, keyword.value],
    () => {
      isPrivate.value ? debounceGetAiPrivate() : debounceGetTalkie();
    },
  );
  async function getTalkie() {
    try {
      loading.value = true;
      const res = await getRoleList({
        page_index: 1,
        page_count: 20,
        tags_type: tags_type.value,
        gender: gender.value,
        language: language.value,
        keyword: keyword.value,
      });
      if (eq(res.code, 0)) {
        talkieList.value = get(res, "data.list", []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      loading.value = false;
    }
  }
  // 获取正在聊的ai
  async function getChatting() {
    try {
      const res = await getChattingAi(route.params.id as string);
      if (eq(res.code, 0)) {
        chattingAi.value = get(res, "data", {});
      } else {
        router.push({ name: "home" });
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
        chatHistoryTotal.value = get(res, "data.total", 0);
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
    chatHistoryTotal,
    page,
    gender,
    language,
    tags_type,
    isPrivate,
    loading,
    keyword,
    getAiPrivate,
    getTag,
    getTalkie,
    getChatting,
    getHistory,
  };
});
