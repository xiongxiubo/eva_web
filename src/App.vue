<template>
  <ElConfigProvider :locale="locale">
    <RouterView v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </RouterView>
  </ElConfigProvider>
</template>
<script setup lang="ts">
import { createAppKit } from '@reown/appkit/vue'
import { ethersAdapter, networks, projectId } from '@/config/index'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import ja from 'element-plus/es/locale/lang/ja'

const { currentLang } = storeToRefs(useLangStore());

const locale = computed(() => {
  switch (currentLang.value) {
    case 'zh-CN':
      return zhCn
    case 'en':
      return en
    case 'ja':
      return ja
    default:
      return zhCn
  }
})
createAppKit({
  adapters: [ethersAdapter],
  networks,
  projectId,
  themeMode: "light",
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    socials: false,
    email: false,
  },
  metadata: {
    name: 'AppKit Vue Example',
    description: 'AppKit Vue Example',
    url: window.location.origin,
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
})

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

// 用法（例如等待 fpClient）

onMounted(() => {
  useLangStore().initLang();
});
</script>
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
