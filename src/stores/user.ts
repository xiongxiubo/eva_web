import { getUserChat } from "@/api";
import { eq, get } from "lodash";

export const useUserStore = defineStore(
  "user",
  () => {
    const token = ref("");
    const email = ref("");
    const chatList = ref<any[]>([]);
    const isCollapse = ref(false);

    async function getChatList() {
      try {
        const res = await getUserChat();
        if (eq(res.code, 0)) {
          chatList.value = get(res, "data.list", []);
        }
      } catch (error) {
        console.log(error);
      }
    }
    return { token, email, chatList, getChatList, isCollapse };
  },
  { persist: true },
);
