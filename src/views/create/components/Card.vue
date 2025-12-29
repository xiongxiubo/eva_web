<script setup lang="ts">
import { formatTime } from '@/utils/time';
interface CardProps {
    name: string;
    description: string;
    created_at: string;
    status: string;
    images: string;
}
const Props = defineProps({
    item: {
        type: Object as () => CardProps,
        default: () => ({})
    }
});
const computedStatus = computed(() => {
    switch (Props.item.status) {
        case 'pending':
            return h(ElTag, { type: 'warning' }, () => '待审核');
        case 'rejected':
            return h(ElTag, { type: 'danger' }, () => '已拒绝');
        default:
            return h(ElTag, { type: 'success' }, () => '已通过');
    }
});
</script>

<template>
    <div class="card-container">
        <div class="cover-area">
            <img lazy :src="item.images" class="real-image" alt="Cover" />
        </div>

        <div class="content-area">
            <div class="header-row">
                <h2 class="title">{{ item.name }}</h2>
                <div class="status-badge">
                    <component :is="computedStatus" />
                </div>
            </div>
            <p class="description">{{ item.description }}</p>
            <div class="divider"></div>
            <div class="footer">创建时间：{{ formatTime(item.created_at) }}</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
// --- SCSS 变量定义 ---
$bg-placeholder: #1c1c1e;
$border-color: #1f1f1f;
$text-secondary: #b0b0b5;
$text-tertiary: #636366;
$accent-color: #000000;

.card-container {
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    border: 1px solid var(--el-border-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    cursor: pointer;

    // SCSS 嵌套：封面区域
    .cover-area {
        position: relative;
        border-radius: 12px;
        margin: 12px;
        width: calc(100% - 24px);
        aspect-ratio: 1 / 1; // 保持正方形
        overflow: hidden;

        .real-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    // SCSS 嵌套：内容区域
    .content-area {
        padding: 0 12px 12px 12px;
        flex: 1;
        display: flex;
        flex-direction: column;

        .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6px;
            gap: 4px;

            .title {
                font-size: 16px;
                font-weight: 700;
                margin: 0;
                word-break: break-all;
            }

            .status-badge {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                gap: 2px;
                padding: 2px 6px;
                border-radius: 20px;
                font-size: 10px;

                .clock-icon {
                    width: 10px;
                    height: 10px;
                }

                .status-text {
                    white-space: nowrap;
                }
            }
        }

        .description {
            font-size: 12px;
            line-height: 1.4;
            color: $text-secondary;
            margin: 0;
            margin-bottom: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2; // 限制2行
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            flex: 1;
        }

        .divider {
            height: 1px;
            background-color: var(--el-border-color);
            margin-bottom: 8px;
            width: 100%;
        }

        .footer {
            font-size: 10px;
            color: $text-tertiary;
        }
    }
}
</style>