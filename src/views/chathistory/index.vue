<template>
    <div class="chathistory">
        <div class="bg" :style="{ background: `url(${chattingAi.avatar}) top / cover no-repeat` }" />
        <div class="title">
            {{ chattingAi.name }} {{ $at('聊天记录') }}
        </div>
        <DynamicScroller class="list" :items="History" :min-item-size="60" key-field="id"
            v-slot="{ item, index, active }" ref="messagesRef" @scroll.passive="handleScroll">
            <DynamicScrollerItem :item="item" :index="index" :active="active" :key="item.id"
                :class="['message-item', item.role === 'user' ? 'user-message' : 'ai-message']">
                <div style="padding: 6px 0;">
                    <!-- AI消息 -->
                    <div v-if="item.role === 'assistant'" class="message-content">
                        <div class="avatar-container">
                            <el-avatar :src="chattingAi.avatar" size="small" />
                        </div>
                        <div class="message-bubble">
                            <div class="content">{{ content(item) }}</div>
                        </div>
                    </div>
                    <!-- 用户消息 -->
                    <div v-if="item.role === 'user'" class="message-content">
                        <div class="message-bubble">
                            <div class="content">{{ content(item) }}</div>
                        </div>
                        <div class="avatar-container">
                            <el-avatar :src="generateAvatar(user.Email)" size="small" />
                        </div>
                    </div>
                </div>
            </DynamicScrollerItem>
        </DynamicScroller>
        <div class="footer" @click="router.replace(`/chat/${chattingAi.id}`)">
            <div class="ai">
                <el-avatar :src="chattingAi.avatar" size="small" />
                <p>{{ ` ${$at('与')} ${chattingAi.name} ${$at('聊天')}` }}</p>
                <el-icon color="#ffd980" size="24">
                    <Comment />
                </el-icon>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { $at } from 'i18n-auto-extractor';
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import { generateAvatar } from '@/utils/utils'
import { cloneDeep } from 'lodash';
const router = useRouter();
const History = computed(() => [...cloneDeep(chatHistory.value)].reverse())
const { user } = storeToRefs(useUserStore())
const loading = ref(false);
const messagesRef = ref<any>(null);

const { chatHistory, chattingAi, page, chatHistoryTotal } = storeToRefs(useTalkieStore());
const content = (item: any) => {
    if (item.role === 'user') {
        return JSON.parse(item.content).content
    }
    return item.content
}
async function handleScroll(e: Event) {
    // 是否滚动到最底部
    const el = e.target as HTMLElement;
    // 当滚动条距离顶部小于 50px，且当前不在加载中时，触发加载
    if (el.scrollTop <= 50 && !loading.value) {
        await loadMore(el);
    }
};
const loadMore = async (el: any) => {
    if (loading.value) return;
    if (chatHistoryTotal.value <= chatHistory.value.length) return;
    const previousScrollHeight = el.scrollHeight;
    loading.value = true;
    page.value++;
    try {
        await useTalkieStore().getHistory();
        await nextTick();
        const heightDifference = el.scrollHeight - previousScrollHeight;
        el.scrollTop += heightDifference;
    } catch (error) {
        console.error("加载失败", error);
        page.value--; // 失败时回退页码
    } finally {
        loading.value = false;

    }
}
onMounted(async () => {
    await useTalkieStore().getHistory();
    await useTalkieStore().getChatting();
    await nextTick()
    if (messagesRef.value) {
        messagesRef.value?.scrollToBottom();
    }
})
onUnmounted(() => {
    page.value = 1;
    chatHistory.value = [];
})
</script>
<style scoped lang="scss">
.chathistory {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 20px;
    box-sizing: border-box;
    position: relative;
    gap: 20px;
    overflow: hidden;
    align-items: center;

    .bg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        filter: blur(100px);
        opacity: .3;
    }

    .title {
        font-size: 24px;
        font-weight: bold;
        width: 100%;
        text-align: center;
    }

    .list {
        display: flex;
        width: 100%;
        max-width: 800px;
        align-self: center;
        flex: 1;
        overflow-y: auto;
        box-sizing: border-box;

        .message-item {
            width: 100%;

            .message-content {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                max-width: 80%;

                .avatar-container {
                    display: flex;
                    align-items: flex-start;
                    margin-top: 4px;
                }

                .message-bubble {
                    padding: 12px 16px;
                    border-radius: 18px;
                    position: relative;
                    background-color: var(--speaker-card-item-bg-color);
                    border: 1px solid var(--el-border-color);

                    .sender-name {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 4px;
                        opacity: 0.8;
                    }

                    .content {
                        font-size: 16px;
                        line-height: 1.5;
                        word-wrap: break-word;
                        white-space: pre-wrap;

                    }

                    .time {
                        font-size: 12px;
                        margin-top: 6px;
                        opacity: 0.6;
                        text-align: right;
                    }
                }
            }

            // AI消息样式 - 左侧
            &.ai-message .message-content {
                align-self: flex-start;

                .message-bubble {
                    border-bottom-left-radius: 4px;

                }
            }

            // 用户消息样式 - 右侧
            &.user-message .message-content {
                // align-self: flex-end;
                // flex-direction: row-reverse;
                justify-content: flex-end;
                margin-left: auto;

                .message-bubble {
                    border-bottom-right-radius: 4px;

                    .sender-name {
                        text-align: right;
                    }

                    .time {
                        text-align: left;
                    }
                }
            }
        }
    }

    .footer {
        height: 52px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 100%;
        max-width: 800px;
        cursor: pointer;
        z-index: 1;

        .ai {
            height: 52px;
            flex: 1;
            border-radius: 16px;
            display: flex;
            align-items: center;
            background: hsla(0, 0%, 100%, .08);
            padding: 0 10px;
            border: 1px solid var(--el-border-color);
            gap: 10px;

            .el-icon {
                margin-left: auto;
            }
        }
    }

    // 响应式调整
    @media (max-width: 768px) {
        .list .message-item .message-content {
            max-width: 90%;
        }
    }
}
</style>
