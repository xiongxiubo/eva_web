import request from "@/utils/request";

type LoginParams = {
  email: string;
  password: string;
};
// 注册参数
type RegisterParams = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
};
type Response = {
  code: number;
  msg: string;
  data: any;
};
interface Params {
  page_index: number;
  page_count: number;
}
interface AiParams extends Params {
  tags_type: string;
}
interface ChatDataParams extends Params {
  talkie_id: string;
}
type web3LoginParams = {
  signature: string;
  msg: string;
  address: string;
};

//登录
export const login: (data: LoginParams) => Promise<Response> = (data: LoginParams) => request.post("/user/login", data);
// 注册
export const register: (data: RegisterParams) => Promise<Response> = (data: RegisterParams) => request.post("/user/register", data);
// 登录web3
export const loginWeb3: (data: web3LoginParams) => Promise<Response> = (data: web3LoginParams) => request.post("/user/web3/login", data);
// 获取用户信息
export const getUserInfo: () => Promise<Response> = () => request.get("/user/info");
// 更新用户信息
export const updateUserInfo: (data: { username?: string; twitter_username?: string }) => Promise<Response> = (data: { username?: string; twitter_username?: string }) => request.put("/user/update/userinfo", data);

// 获取tag列表
export const getTagList: () => Promise<Response> = () => request.get("/tags/list");
// 获取ai角色列表
export const getRoleList: (params: AiParams) => Promise<Response> = (params: AiParams) => request.get("/ai/list", { params });
// 获取正在聊的ai
export const getChattingAi: (talkie_id: string) => Promise<Response> = (talkie_id: string) => request.get("/ai/current", { params: { talkie_id } });

// 获取用户聊过的ai
export const getUserChat: () => Promise<Response> = () => request.get("/chat/records");
// 删除用户聊过的ai
export const deleteUserChat: (talkie_id: string) => Promise<Response> = (talkie_id: string) => request.delete("/chat/records", { data: { talkie_id } });

// 获取聊天记录等数据
export const getChatData: (params: ChatDataParams) => Promise<Response> = (params: ChatDataParams) => request.get("/chat/talkie", { params });

// 热门ai
export const getHotAi: () => Promise<Response> = () => request.get("/ai/hot");

// 说话人列表
export const getSpeakerList: (params: Params) => Promise<Response> = (params: Params) => request.get("/speaker/list", { params });

// 添加说话人
export const addSpeaker: (data: { speaker: string; audio_data: string }) => Promise<Response> = (data: { speaker: string; audio_data: string }) => request.post("/speaker/add", data);

// 删除说话人
export const deleteSpeaker: (audio_id: number) => Promise<Response> = (audio_id: number) => request.delete("/speaker/delete", { data: { audio_id } });
// 修改说话人
export const updateSpeaker: (data: { audio_id: number; speaker: string }) => Promise<Response> = (data: { audio_id: number; speaker: string }) => request.put("/speaker/update", data);

// 获取记忆列表
export const getMemoryList: () => Promise<Response> = () => request.get("/memory/list");
