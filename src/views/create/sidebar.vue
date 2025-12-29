<template>
    <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
        <div class="logo-area">
            <span class="logo-text">{{ $at('创作中心') }}</span>
            <el-icon :size="20" v-if="isMobile" @click="isMobileMenuOpen = !isMobileMenuOpen">
                <Fold />
            </el-icon>
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

</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Avatar, Mic } from '@element-plus/icons-vue';
import { $at } from 'i18n-auto-extractor';
const { isMobileMenuOpen } = storeToRefs(useCreationStore());
const router = useRouter();
const route = useRoute();
const { isMobile } = useDevice()
const menuItems = [
    { name: $at('我的人物'), icon: Avatar, path: '/create' },
    { name: $at('我的音色'), icon: Mic, path: '/create/voice' },
];
const activeIndex = computed(() => {
    const activePath = route.path;
    return menuItems.findIndex(item => item.path === activePath);
});
// --- 方法 ---
const setActiveItem = (index: number) => {
    router.push(menuItems[index].path);
};
</script>
<style scoped lang="scss">
/* --- 侧边栏 --- */
.sidebar {
    width: 240px;
    background: var(--menu-bg-color);
    // background-color: #000;
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
        justify-content: space-between;
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

@media (max-width: 768px) {

    /* Sidebar 变为抽屉模式 */
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        transform: translateX(-100%);
    }

    /* 激活时滑入 */
    .sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5);
    }
}
</style>