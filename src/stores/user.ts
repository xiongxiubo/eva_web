import { eq, get } from "lodash";

export const useUserStore = defineStore(
  "user",
  () => {
    const token = ref("");
    const user = ref<any>({});
    const chatList = ref<any[]>([]);
    const isCollapse = ref(false);
    const router = useRouter();
    // 获取用户信息
    async function getUser() {
      try {
        const res = await getUserInfo();
        if (eq(res.code, 0)) {
          user.value = get(res, "data", {});
        } else if (eq(res.code, 40001)) {
          token.value = "";
          user.value = {};
          router.push("/login");
        }
      } catch (error) {
        console.log(error);
      }
    }

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

    return { token, chatList, getChatList, isCollapse, getUser, user };
  },
  { persist: true },
);
