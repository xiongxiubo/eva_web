import router from "@/router";
import axios from "axios";
import { ElMessageBox } from "element-plus";
import { eq } from "lodash";
let isShowingLoginAlert = false;
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 60000,
});

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = token;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
request.interceptors.response.use(
  response => {
    if (eq(response.data.code, 401) && !isShowingLoginAlert) {
      console.log("登录过期，请重新登录");
      isShowingLoginAlert = true;
      ElMessageBox.alert("登录过期，请重新登录", "提示", {
        confirmButtonText: "确定",
        type: "warning",
      })
        .then(() => {
          router.push("/login");
        })
        .finally(() => {
          isShowingLoginAlert = false;
        });
    }
    return response.data;
  },
  error => {
    return Promise.reject(error);
  },
);

export default request;
