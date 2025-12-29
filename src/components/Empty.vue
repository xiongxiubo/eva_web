<template>
    <div class="empty-wrapper">
        <div class="empty-container">
            <!-- 3D 动画图标区域 -->
            <div class="icon-wrapper">
                <div class="empty-icon-blob">
                    <svg viewBox="0 0 24 24" class="svg-icon">
                        <path
                            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                </div>
            </div>

            <h3 class="title">{{ title }}</h3>
            <p class="description">{{ description }}</p>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: { type: String, default: '时空坐标未找到' },
    description: { type: String, default: '在这个平行世界里，暂时还没有这个角色的足迹。你可以尝试缩减关键词。' },
    primaryText: { type: String, default: '换个词搜搜' },
    secondaryText: { type: String, default: '去首页逛逛' }
});
defineEmits(['primaryClick', 'secondaryClick']);
</script>

<style scoped>
/* ============================================================
   1. 基础样式与亮色变量 (默认)
   ============================================================ */
.empty-wrapper {
    /* 亮色模式变量 */
    --empty-title-color: #1a1a1c;
    --empty-desc-color: #64748b;
    --empty-blob-bg: rgba(0, 0, 0, 0.05);
    --empty-blob-border: rgba(0, 0, 0, 0.1);
    --empty-icon-color: #94a3b8;

    --empty-btn-pri-bg: #000000;
    --empty-btn-pri-text: #ffffff;
    --empty-btn-sec-bg: transparent;
    --empty-btn-sec-text: #64748b;
    --empty-btn-sec-border: #e2e8f0;

    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    width: 100%;
    background: transparent;
    /* 背景透明 */
    transition: all 0.3s ease;
}

/* ============================================================
   2. 暗色模式变量 (当父级有 .dark 时)
   ============================================================ */
:global(.dark) .empty-wrapper {
    /* 显著提高对比度 */
    --empty-title-color: #ffffff;
    /* 标题变纯白 */
    --empty-desc-color: #9499a1;
    /* 描述变浅灰 */
    --empty-blob-bg: rgba(255, 255, 255, 0.08);
    --empty-blob-border: rgba(255, 255, 255, 0.15);
    --empty-icon-color: #ffffff;
    /* 图标变纯白 */

    --empty-btn-pri-bg: #ffffff;
    /* 按钮变白底 */
    --empty-btn-pri-text: #000000;
    /* 按钮变黑字 */
    --empty-btn-sec-bg: rgba(255, 255, 255, 0.05);
    --empty-btn-sec-text: #9499a1;
    --empty-btn-sec-border: rgba(255, 255, 255, 0.1);
}

/* ============================================================
   3. 细节样式
   ============================================================ */
.empty-container {
    text-align: center;
    max-width: 400px;
    padding: 40px;
}

.icon-wrapper {
    margin-bottom: 24px;
}

.empty-icon-blob {
    width: 100px;
    height: 100px;
    background: var(--empty-blob-bg);
    border: 1px solid var(--empty-blob-border);
    border-radius: 35% 65% 70% 30% / 30% 40% 60% 70%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: blob 6s ease-in-out infinite;
    backdrop-filter: blur(4px);
}

.svg-icon {
    width: 40px;
    height: 40px;
    fill: var(--empty-icon-color);
}

.title {
    font-size: 24px;
    margin: 0 0 12px 0;
    color: var(--empty-title-color);
    /* 修正：不再使用渐变以免在部分浏览器失效 */
    font-weight: 600;
}

.description {
    font-size: 14px;
    color: var(--empty-desc-color);
    line-height: 1.6;
    margin-bottom: 32px;
}

.action-group {
    display: flex;
    gap: 16px;
    justify-content: center;
}

.btn {
    padding: 10px 28px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.btn-primary {
    background: var(--empty-btn-pri-bg);
    color: var(--empty-btn-pri-text);
}

.btn-secondary {
    background: var(--empty-btn-sec-bg);
    color: var(--empty-btn-sec-text);
    border-color: var(--empty-btn-sec-border);
}

.btn:hover {
    transform: translateY(-2px);
    opacity: 0.9;
}

@keyframes blob {

    0%,
    100% {
        border-radius: 35% 65% 70% 30% / 30% 40% 60% 70%;
    }

    50% {
        border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%;
    }
}
</style>