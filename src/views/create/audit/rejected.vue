<template>
    <el-empty v-if="auditList.length === 0" description="暂无审核失败人物" />
    <div class="content-grid">
        <div v-for="card in auditList" :key="card.id" class="card" @click="current = card; visible = true;">
            <div class="card-tag">{{ $at('审核失败') }}</div>
            <img lazy :src="card.images" class="card-image" alt="">
            <div class="card-body">
                <div class="card-header">
                    <h3 class="card-title">{{ card.name }}</h3>
                </div>
                <p class="card-desc">{{ card.description }}</p>
                <div class="card-footer">
                    {{ $at('审核失败原因') }}: <span>{{ card.comments }}</span>
                </div>
            </div>
        </div>
    </div>
    <Details v-model="visible" :current="current" />
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import Details from './Details.vue';

const auditStore = useAuditStore();
const { auditList } = storeToRefs(auditStore);
const current = ref<any>({});
const visible = ref<boolean>(false);
onMounted(() => {
    auditStore.GetAuditList("rejected");
});
</script>
<style scoped lang="scss">
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
    position: relative;

    .card-tag {
        width: fit-content;
        position: absolute;
        right: 0px;
        top: 15px;
        background-color: var(--el-color-danger);
        color: #fff;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 3px;
        transform: rotate(45deg);
        z-index: 10;
    }

    .card-image {
        width: 100%;
        aspect-ratio: 1/1;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom: 1px solid var(--el-border-color);
        object-fit: contain;
        padding: 10px;
        box-sizing: border-box;

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

            span {
                font-weight: 600;
                color: var(--el-color-danger);
            }
        }
    }
}

@media (max-width: 768px) {
    .content-grid {
        padding: 16px;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }

    .card .card-body .card-title {
        max-width: 100%;
    }
}
</style>
