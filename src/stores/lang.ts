import enJSON from "@/locales/en.json";
import zhJSON from "@/locales/zh-CN.json";
import jaJSON from "@/locales/ja.json";
import { useVueAt } from "i18n-auto-extractor/vue";

export const useLangStore = defineStore(
  "lang",
  () => {
    const lang = [
      { name: "简体中文", code: "zh-cn", json: zhJSON },
      { name: "English", code: "en", json: enJSON },
      { name: "日本語", code: "ja", json: jaJSON },
    ];
    const currentLang = ref<string>("zh-cn");
    const { setCurrentLang } = useVueAt();
    function setLang(code: string, json: any) {
      currentLang.value = code;
      setCurrentLang(code, json);
    }
    // 初始化语言
    function initLang() {
      const langItem = lang.find((item: any) => item.code === currentLang.value);
      if (langItem) {
        setLang(langItem.code, langItem.json);
      }
    }

    return {
      lang,
      currentLang,
      setLang,
      initLang,
    };
  },
  {
    persist: true,
  },
);
