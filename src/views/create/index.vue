<template>
    <div class="action-bar">
        <button class="create-btn" @click="router.push('/create/edit')">
            <el-icon style="width:16px; margin-right:4px">
                <Plus />
            </el-icon>
            <span class="btn-text">{{ $at('创建人物') }}</span>
            <span class="btn-text-mobile">{{ $at('创建') }}</span>
        </button>
    </div>
    <el-empty v-if="characterList.length === 0" description="还没有人物，快去创建一个吧" />
    <div class="content-grid">
        <div v-for="card in characterList" :key="card.id" class="card"
            @click="detailDialogVisible = true; currentCard = card">
            <img lazy :src="card.avatar_url" class="card-image" alt="">
            <div class="card-body">
                <div class="card-header">
                    <h3 class="card-title">{{ card.name }}</h3>
                </div>
                <p class="card-desc">{{ card.description }}</p>
                <div class="card-footer">
                    {{ formatTime(card.created_at) }}
                </div>
            </div>
        </div>
    </div>
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" :center="true" :width="width">
        <el-descriptions :title="$at('模型详情')" border direction="vertical" :column="4">
            <el-descriptions-item :width="140" :rowspan="2" :label="$at('图片')" align="center">
                <el-image lazy style="width: 100px; height: 100px" :src="currentCard.avatar_url"
                    :preview-src-list="[currentCard.avatar_url]" preview-teleported fit="contain" />
            </el-descriptions-item>
            <el-descriptions-item :label="$at('模型名称')" :min-width="200">{{ currentCard.name }}</el-descriptions-item>
            <el-descriptions-item :label="$at('性别')">{{ currentCard.gender === 'M' ? '男' : '女' }}</el-descriptions-item>
            <el-descriptions-item :label="$at('语言')">{{ currentCard.language }}</el-descriptions-item>
            <el-descriptions-item :label="$at('语音信息')"> 语音名称：{{ currentCard.voice_name }} </el-descriptions-item>
            <el-descriptions-item :label="$at('是否推荐')">{{ currentCard.is_recommended ? '是' :
                '否' }}</el-descriptions-item>
            <el-descriptions-item :label="$at('是否公开')">{{ currentCard.is_public ? '是' : '否' }}</el-descriptions-item>
            <el-descriptions-item :label="$at('创建时间')">{{ formatTime(currentCard.created_at) }}</el-descriptions-item>
            <el-descriptions-item :label="$at('欢迎语')">{{ currentCard.welcome_text }}</el-descriptions-item>
            <el-descriptions-item :label="$at('模型路径')" :span="2">{{ currentCard.model_url }}</el-descriptions-item>
            <el-descriptions-item :label="$at('描述')" :span="4">{{ currentCard.description }}</el-descriptions-item>
            <el-descriptions-item :label="$at('提示词')" :span="4">{{ currentCard.prompt }}</el-descriptions-item>
        </el-descriptions>
    </el-dialog>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import { formatTime } from '@/utils/time';
const auditStore = useAuditStore();
const { characterList } = storeToRefs(auditStore);
const { isMobile } = useDevice();
const width = computed(() => isMobile.value ? '100%' : '800px');
const router = useRouter();
const detailDialogVisible = ref(false);
const currentCard = ref<any>({});

onMounted(() => {
    auditStore.GetCharacterList();
});

</script>
<style lang="scss" scoped>
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
    cursor: pointer;

    .card-image {
        width: 100%;
        aspect-ratio: 1/1;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom: 1px solid var(--el-border-color);
        object-fit: contain;
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