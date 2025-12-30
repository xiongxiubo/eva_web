<template>
    <div class="chat-preview-page">
        <header class="header">
            <h1 class="title">{{ $at('预览和测试') }}</h1>
            <p class="subtitle">{{ $at('注意：模型 所说的一切都是人工智能编造的！') }}</p>
        </header>
        <main class="main-content">
            <span class="not" v-if="!auditDetail.model_url">{{ $at('模型暂未创建') }}</span>
            <div v-else v-loading="isHeadLoading" :element-loading-text="$at('模型加载中...')" ref="avatarRef"
                class="avatar" />
        </main>
        <footer class="footer">
            <div class="input-bar" v-if="!isHeadLoading">
                <el-button :loading="isWsLoading" :icon="Connection" class="connect-btn"
                    @click="connect(auditDetail.virtual_id)" v-if="!isConnected">
                    {{ $at('开始测试') }}
                </el-button>
                <div class="input-container" v-if="isConnected">
                    <!-- <div class="actions">
                        <button>重置</button>
                    </div> -->
                    <input class="input-field" type="text" v-model="message" :disabled="isSpeaker">
                    <div class="actions">
                        <button class="btn-send" @click="send">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import { Connection } from '@element-plus/icons-vue'
const avatarRef = ref<HTMLDivElement | null>(null);
const message = ref('');
const { GetModelDetail } = useAuditStore();
const { auditDetail } = storeToRefs(useAuditStore());
const { sendWsMessage, connect, isConnected, isWsLoading, msg, clone } = useCoreWebSocket();
const { initHead, handleWsJsonMessage, isSpeaker, NewModelRender, isHeadLoading } = useCoreRunder()
const islock = ref(false);
const route = useRoute();
defineExpose({ clone })
const send = () => {
    if (!isConnected.value) return ElMessage.error($at('请先连接'));
    const text = message.value.trim();
    if (!text) return ElMessage.error($at('请输入消息'));
    sendWsMessage({ type: "text", data: text });
    message.value = '';
};

watch(msg, (newMsg) => {
    if (!newMsg) return;
    if (typeof newMsg === 'string') {
        try {
            const data = JSON.parse(newMsg);
            handleWsJsonMessage(data);
        } catch (error) {
            console.error('Error parsing JSON message:', error);
        }
    }
})
onMounted(async () => {
    console.log(auditDetail.value)
    if (!route.query.id) return
    await GetModelDetail(Number(route.query.id));
    if (auditDetail.value.model_url === "" || !auditDetail.value.model_url) return;
    nextTick(async () => {
        if (!avatarRef.value) return;
        NewModelRender(avatarRef.value, {
            gender: auditDetail.value.gender,
            action: auditDetail.value.action,
            url: auditDetail.value.model_url,
        });
        await initHead();
    })
})
onUnmounted(() => {
    islock.value = false;
    auditDetail.value = {};
})
</script>
<style scoped lang="scss">
$text-secondary: #666666;

.chat-preview-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
    gap: 10px;

    .header {
        .title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .subtitle {
            font-size: 0.75rem;
            color: $text-secondary;
        }
    }

    .main-content {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        .not {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: $text-secondary;
        }

        .avatar {
            width: 100%;
            height: 100%;
        }

    }

    .footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding-bottom: 10px;
        min-height: 44px;

        .input-bar {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 15px;

            .connect-btn {
                flex: 1;
                height: 44px;
            }

            .input-container {
                flex: 1;
                height: 44px;
                border-radius: 22px;
                display: flex;
                align-items: center;
                padding: 0 12px 0 20px;
                border: 1px solid var(--el-border-color);

                .input-field {
                    flex: 1;
                    border: 0;
                    height: calc(100% - 10px);
                    background: transparent;

                    &:focus {
                        outline: none;
                    }
                }

                .actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    button {
                        background: none;
                        border: none;
                        color: inherit;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        padding: 0;

                        &.btn-add {
                            font-size: 1.5rem;
                            line-height: 1;
                        }

                        &.btn-send {
                            transform: rotate(-10deg); // 稍微倾斜还原图标角度
                            opacity: 0.6;
                        }
                    }
                }
            }
        }
    }
}
</style>