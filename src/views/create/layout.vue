<template>
    <div class="app-container">
        <div class="mobile-overlay" :class="{ 'show': isMobileMenuOpen }" @click="closeMobileMenu"></div>
        <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
            <div class="logo-area">
                <span class="logo-text">{{ $at('创作中心') }}</span>
            </div>
            <div class="nav-group">
                <button class="nav-btn back-home" @click="router.push('/')">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    {{ $at('返回首页') }}
                </button>
            </div>

            <div class="nav-group menu">
                <div v-for="(item, index) in menuItems" :key="item.name" class="menu-item"
                    :class="{ active: index === activeIndex }" @click="setActiveItem(index)">
                    <component :is="item.icon" class="icon" />
                    {{ item.name }}
                </div>
            </div>
        </aside>

        <main class="main-content">
            <Header />
            <router-view />
        </main>
    </div>
</template>
<script setup lang="ts">
import Header from './header.vue'
import { Avatar, CircleCloseFilled, Mic, Stamp } from '@element-plus/icons-vue';
import { $at } from 'i18n-auto-extractor';
const router = useRouter();
const route = useRoute();
// --- 状态管理 ---
const isMobileMenuOpen = ref(false); // 控制手机端菜单开关

const activeIndex = computed(() => {
    const activePath = route.path;
    return menuItems.findIndex(item => item.path === activePath);
});
const menuItems = [
    { name: $at('我的人物'), icon: Avatar, path: '/create' },
    { name: $at('我的音色'), icon: Mic, path: '/create/voice' },
    { name: $at('审核中'), icon: Stamp, path: '/create/audit' },
    { name: $at('审核失败'), icon: CircleCloseFilled, path: '/create/audit/rejected' },
];
// --- 方法 ---
const setActiveItem = (index: number) => {
    router.push(menuItems[index].path);
};
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

/* --- 侧边栏 --- */
.sidebar {
    width: 240px;
    background-color: var(--el-menu-bg-color);
    border-right: 1px solid var(--el-border-color);
    display: flex;
    flex-direction: column;
    padding: 20px 16px;
    flex-shrink: 0;
    z-index: 100;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .logo-area {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
    }

    .nav-group {
        margin-bottom: 12px;

        .icon {
            width: 24px;
            height: 24px;
        }
    }

    .nav-btn {
        background: transparent;
        border: 1px solid var(--el-menu-border-color);
        width: 100%;
        padding: 8px 12px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 14px;

        &:hover {
            background: var(--el-menu-hover-bg-color);
        }
    }

    .menu {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 24px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;

            &:hover {
                color: #fff;
                background-color: #111;
            }

            &.active {
                background-color: var(--el-menu-active-bg-color);
                color: var(--menu-active-color);
            }
        }
    }
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

    /* Sidebar 变为抽屉模式 */
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        transform: translateX(-100%);
        /* 默认移出屏幕 */
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5);
        background-color: #0a0a0a;
        /* 稍微深一点以便区分 */
    }

    /* 激活时滑入 */
    .sidebar.mobile-open {
        transform: translateX(0);
    }

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