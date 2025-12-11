<template>
    <div class="app-container">
        <div class="mobile-overlay" :class="{ 'show': isMobileMenuOpen }" @click="closeMobileMenu"></div>
        <Sidebar />
        <main class="main-content">
            <Header />
            <router-view />
        </main>
    </div>
</template>
<script setup lang="ts">
import Header from './header.vue'
import Sidebar from './sidebar.vue'
// --- 状态管理 ---
const isMobileMenuOpen = ref(false); // 控制手机端菜单开关
const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
};

</script>
<style lang="scss" scoped>
.app-container {
    display: flex;
    width: 100vw;
    height: 100vh;
    background-color: var(--main-bg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    overflow: hidden;
    position: relative;
}



/* --- 移动端遮罩层 --- */
.mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 90;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;

    &.show {
        opacity: 1;
        pointer-events: auto;
    }
}

/* --- 主内容区 --- */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--main-bg);
    padding: 0;
    width: 100%;
}


/* =========================================
   Mobile Responsive Styles (Max-width 768px)
   ========================================= */
@media (max-width: 768px) {



    /* Header 调整 */
    .top-header {
        padding: 0 16px;
        /* 减小内边距 */

        .hamburger-btn {
            display: block;
            /* 显示菜单按钮 */
        }

        .header-right {
            .desktop-only {
                display: none;
                /* 隐藏次要按钮 */
            }
        }
    }
}
</style>