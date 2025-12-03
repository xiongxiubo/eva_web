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
            <div class="action-bar">
                <button class="create-btn" @click="router.push('/create/edit')">
                    <el-icon style="width:16px; margin-right:4px">
                        <Plus />
                    </el-icon>
                    <span class="btn-text">{{ $at('创建人物') }}</span>
                    <span class="btn-text-mobile">{{ $at('创建') }}</span>
                </button>
            </div>

            <div class="content-grid">
                <div v-for="card in cards" :key="card.id" class="card">
                    <div class="card-image">
                        <div class="placeholder-pattern">
                            <span class="talkie-watermark">talkie</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="card-header">
                            <h3 class="card-title">{{ card.title }}</h3>
                        </div>
                        <p class="card-desc">{{ card.description }}</p>
                        <div class="card-footer">
                            {{ card.lastEdited }}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>
<script setup lang="ts">
import Header from './header.vue'
import { Avatar, CircleCloseFilled, Stamp } from '@element-plus/icons-vue';
import { $at } from 'i18n-auto-extractor';
// --- 类型定义 ---
interface CardItem {
    id: number;
    title: string;
    description: string;
    status: 'Draft' | 'Under Review' | 'Public';
    lastEdited: string;
    isSample: boolean;
}
const router = useRouter();
// --- 状态管理 ---
const isMobileMenuOpen = ref(false); // 控制手机端菜单开关

const activeIndex = ref(0);
const menuItems = [
    { name: $at('我的人物'), icon: Avatar },
    { name: $at('审核中'), icon: Stamp },
    { name: $at('审核失败'), icon: CircleCloseFilled },
];

// --- 方法 ---
const setActiveItem = (index: number) => {
    activeIndex.value = index;
};

const cards = ref<CardItem[]>([
    {
        id: 1,
        title: 'Homework ...',
        description: "Just like the name says, feed me your homework by typing/picture I'll give t...",
        status: 'Draft',
        lastEdited: 'Edited 12-02 10:17',
        isSample: true,
    },
    {
        id: 2,
        title: 'Mobile Test',
        description: "This is a card to test the responsive grid layout on mobile screens.",
        status: 'Draft',
        lastEdited: 'Edited 12-03 09:00',
        isSample: false,
    }
]);

// --- 方法 ---
const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
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

.action-bar {
    display: flex;
    justify-content: end;
    align-items: center;
    padding: 10px 30px;

    .create-btn {
        background-color: var(--el-menu-active-bg-color);
        color: var(--menu-active-color);
        border: 1px solid var(--el-menu-border-color);
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;

        .btn-text-mobile {
            display: none;
        }
    }
}

/* --- 卡片网格 --- */
.content-grid {
    padding: 20px 30px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    overflow-y: auto;
    /* 内容溢出滚动 */
}

.card {
    background-color: var(--home-card-item-background);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--el-border-color);

    .card-image {
        width: 100%;
        aspect-ratio: 1/1;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom: 1px solid var(--el-border-color);

        .placeholder-pattern {
            color: #333;
            font-size: 32px;
            font-weight: 900;
            letter-spacing: -1px;
            opacity: 0.5;
        }
    }

    .card-body {
        padding: 12px;

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;

            .card-title {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 60%;
            }

            .badge-status {
                background-color: #1f2937;
                color: #9ca3af;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 3px;
            }
        }

        .card-desc {
            margin: 0 0 12px 0;
            font-size: 12px;
            color: #888;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .card-footer {
            font-size: 10px;
            color: #555;
        }
    }
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

    /* Action Bar 调整 */
    .action-bar {
        padding: 10px 16px;

        .create-btn {
            padding: 6px 12px;

            .btn-text {
                display: none;
            }

            .btn-text-mobile {
                display: inline;
            }
        }
    }

    /* Content Grid 调整 */
    .content-grid {
        padding: 16px;
        gap: 16px;
        /* 手机上通常单列或者双列，这里维持自适应但减小间距 */
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }

    /* 卡片调整 */
    .card .card-body .card-title {
        max-width: 100%;
        /* 允许标题在小卡片中占据更多空间 */
    }
}
</style>