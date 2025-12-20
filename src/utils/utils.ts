import { createAvatar } from "@dicebear/core";
import { initials } from "@dicebear/collection";
// 一串长字符串，获取前四位后四位，中间用...代替
export function ellipsis(str: string) {
  if (!str) {
    return "";
  }
  if (str.length <= 8) {
    return str;
  }
  return str.slice(0, 6) + "..." + str.slice(-4);
}

export function generateAvatar(seed: string): string {
  const svg = createAvatar(initials, {
    seed,
    size: 64,
  }).toString();
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
