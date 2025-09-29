<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
const isDark = useDark();

// 禁止文字选中
document.addEventListener('selectstart', e => e.preventDefault());

// 禁止长按
document.addEventListener('touchstart', e => {
  if (e.touches.length > 1) e.preventDefault(); // 禁止多指操作
});

// 禁止下拉超出边界
const content = document.querySelector('.content');
let startY = 0;

content?.addEventListener('touchstart', (e: any) => {
  startY = e.touches[0].clientY;
});
onMounted(() => {
  console.log(localStorage.getItem('vueuse-color-scheme'));
  if (localStorage.getItem('vueuse-color-scheme') == 'auto') {
    isDark.value = true
    useToggle(isDark);
  }
})
</script>

<template>
  <RouterView />
</template>

<style scoped>
/* 禁止文本选择和长按菜单 */
body {
  margin: 0;
  height: 100vh;
  overflow: hidden;
  /* 禁止页面整体滚动 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  background: #f2f2f2;
}
</style>
