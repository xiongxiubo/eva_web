<template>
    <div class="header">
        <div v-if="!isMobile" v-show="!isChat" class="header_content">
            <Search />
            <div style="display: flex; align-items: center;">
                <Theme />
                <Lang />
                <UserInfo />
            </div>
        </div>
        <div class="nav" v-show="!isChat" v-if="isMobile">
            <el-icon :size="24" @click="isCollapse = !isCollapse">
                <Expand />
            </el-icon>
            <div style="display: flex; align-items: center;">
                <Theme />
                <Lang />
                <UserInfo />
            </div>
        </div>
        <div class="navbar" v-show="isChat">
            <div class="navber_l" @click="handleBack" style="cursor: pointer;">
                <el-icon :size="24">
                    <ArrowLeft />
                </el-icon>

            </div>
            <div class="navber_chat">
                <el-avatar :src="chattingAi.avatar" :size="32" fit="cover" />
                <div class="navber_chat_info">
                    <div class="navber_chat_title">
                        {{ chattingAi.name }}
                    </div>
                    <!-- <div class="navber_chat_desc">
                        {{ chattingAi.description }}
                    </div> -->
                </div>

            </div>
            <div class="navber_r">
                <!-- <el-icon :size="24" color="#fff">
                    <MoreFilled />
                </el-icon> -->
                <UserInfo />
            </div>
        </div>
    </div>
    <el-drawer v-model="drawer" :with-header="false" size="70%">
        <div class="ai-info">
            <el-avatar :src="chattingAi.avatar" :size="64" />
            <h4>{{ chattingAi.name }}</h4>
            <CollapsibleText>
                {{ chattingAi.description }}
            </CollapsibleText>
        </div>
        <div class="content">
            <DynamicScroller class="msg_item" :items="renderList" :min-item-size="50" v-slot="{ item, index, active }"
                key-field="ID" ref="messagesRef" @scroll.passive="handleScroll">
                <DynamicScrollerItem :item="item" :active="active">
                    <div style="padding: 6px 0;">
                        <div class="msg_item_content" :class="item.role === 'user' ? 'user' : 'chat'">
                            <el-avatar :src="chattingAi.avatar" :size="32" fit="cover" v-if="item.role !== 'user'" />
                            <p>{{ item.content }}</p>
                            <el-avatar :icon="UserFilled" v-if="item.role === 'user'" />
                        </div>
                    </div>
                </DynamicScrollerItem>
            </DynamicScroller>
        </div>
    </el-drawer>
</template>
<script setup lang="ts">
import { UserFilled } from "@element-plus/icons-vue";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";

const { isCollapse, } = storeToRefs(useUserStore());
const { chattingAi, chatHistory, page } = storeToRefs(useTalkieStore());
const route = useRoute();
const router = useRouter();
const { isMobile } = useDevice();

const drawer = ref<boolean>(false);
const renderList = computed(() => [...chatHistory.value].reverse());
const isChat = computed(() => {
    if (route.path === "/chat") {
        return true;
    }
    return false;
});
const messagesRef = ref<any>(null);
let loadingHistory = false;

async function handleScroll(e: Event) {
    const el = e.target as HTMLElement;
    if (el.scrollTop === 0) loadHistory();
};
async function loadHistory() {
    if (loadingHistory) return;
    loadingHistory = true;
    const el = messagesRef.value.$el;
    const oldHeight = el?.scrollHeight || 0;

    page.value++;
    await useTalkieStore().getHistory();
    await nextTick();
    // 保持滚动位置
    if (el) messagesRef.value.$el.scrollTop = el.scrollHeight - oldHeight;

    loadingHistory = false;
};
const handleBack = () => {
    router.replace({ path: "/" });
};
watch(drawer, (newVal) => {
    if (newVal) {
        nextTick(() => {
            if (messagesRef.value) messagesRef.value?.scrollToBottom();
        });
    }
})


</script>
<style scoped lang="scss">
.header {
    width: 100%;
    height: 60px;
    background-color: var(--el-header-bg-color);

    .header_content {
        display: flex;
        justify-content: space-between;
        padding-top: 10px;
    }

    .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 100%;

    }

    .navbar {
        width: 100%;
        display: flex;
        align-items: center;
        height: 60px;
        padding: 0 10px;
        box-sizing: border-box;
        margin-bottom: auto;
        z-index: 1;

        .navber_l {
            img {
                width: 24px;
                height: 24px;
                cursor: pointer;
            }
        }

        .navber_chat {
            display: flex;
            align-items: center;
            width: calc(100% - 100px);
            margin: auto;

            .el-avatar {
                margin-right: 10px;
                flex-shrink: 0;
            }

            .navber_chat_info {
                width: calc(100% - 40px);
            }

            .navber_chat_title {
                font-size: 16px;
                font-weight: 500;
            }

            .navber_chat_desc {
                width: 100%;
                font-size: 14px;
                color: #999;
                // 超出部分省略号
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}

.el-drawer {
    .ai-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: auto;

        h4 {
            margin: 10px 0;
        }
    }

    .content {
        margin-top: 10px;
        width: 100%;
        height: calc(100% - 154px);
        overflow-y: auto;

        .msg_item {
            height: 100%;

            .msg_item_content {
                display: flex;
                align-items: start;
                margin-bottom: 10px;

                p {
                    max-width: 60%;
                    background: linear-gradient(0deg, #737373, #737373), rgba(48, 48, 46, .9);
                    padding: 10px;
                    word-wrap: break-word;
                    margin: 0 5px;

                }
            }

            .user {
                justify-content: flex-end;

                p {
                    border-radius: 12px 2px 16px 12px;
                }
            }

            .chat {
                justify-content: flex-start;

                p {
                    border-radius: 2px 12px 12px 16px;
                }
            }
        }
    }
}
</style>
