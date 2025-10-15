// 一串长字符串，获取前四位后四位，中间用...代替
export function ellipsis(str: string) {
  if (str.length <= 8) {
    return str;
  }
  return str.slice(0, 6) + "..." + str.slice(-4);
}
