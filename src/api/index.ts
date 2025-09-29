import request from "@/utils/request";

type LoginParams = {
  email: string;
  password: string;
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

//登录
export const login: (data: LoginParams) => Promise<Response> = (
  data: LoginParams
) => request.post("/user/login", data);

// 获取tag列表
export const getTagList: () => Promise<Response> = () =>
  request.get("/tags/list");
// 获取ai角色列表
export const getRoleList: (params: AiParams) => Promise<Response> = (
  params: AiParams
) => request.get("/ai/list", { params });
// 获取正在聊的ai
export const getChattingAi: (talkie_id: string) => Promise<Response> = (
  talkie_id: string
) => request.get("/ai/current", { params: { talkie_id } });

// 获取用户聊过的ai
export const getUserChat: () => Promise<Response> = () =>
  request.get("/chat/records");
// 删除用户聊过的ai
export const deleteUserChat: (talkie_id: string) => Promise<Response> = (
  talkie_id: string
) => request.delete("/chat/records", { data: { talkie_id } });

// 获取聊天记录等数据
export const getChatData: (params: ChatDataParams) => Promise<Response> = (
  params: ChatDataParams
) => request.get("/chat/talkie", { params });

// 热门ai
export const getHotAi: () => Promise<Response> = () => request.get("/ai/hot");

// 说话人列表
export const getSpeakerList: (params: Params) => Promise<Response> = (
  params: Params
) => request.get("/speaker", { params });

// 设置说话人
export const setSpeaker: (data: {
  id: number;
  speaker: string;
}) => Promise<Response> = (data: { id: number; speaker: string }) =>
  request.post("/speaker", data);
