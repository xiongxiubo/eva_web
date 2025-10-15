<template>
    <div class="msg" :class="msgClass" ref="msgRef">
        <div class="msg-bg" />
        <div class="navbar" v-if="!isMobile">
            <div class="navber_l" @click="isShowMsg = false">
                <el-icon :size="24">
                    <Expand />
                </el-icon>
            </div>
        </div>
        <div class="ai-info" v-show="!isMobile">
            <el-avatar :src="chattingAi.avatar" :size="64" />
            <h4>{{ chattingAi.name }}</h4>
            <CollapsibleText>
                {{ chattingAi.description }}
            </CollapsibleText>
        </div>
        <div class="content" v-show="!isMobile">
            <DynamicScroller class="msg_item" :items="renderList" :min-item-size="50" v-slot="{ item, index, active }"
                key-field="ID" ref="messagesRef" @scroll.passive="handleScroll">
                <DynamicScrollerItem :item="item" :active="active">
                    <div style="padding: 6px 0;">
                        <div class="msg_item_content" :class="item.role === 'user' ? 'user' : 'chat'">
                            <el-avatar :src="chattingAi.avatar" :size="32" fit="cover" v-if="item.role !== 'user'" />
                            <p>{{ item.content }}</p>
                            <el-avatar :icon="UserFilled" :size="32" v-if="item.role === 'user'" />
                        </div>
                    </div>
                </DynamicScrollerItem>
            </DynamicScroller>
        </div>
        <div class="tail">
            <el-icon style="cursor: pointer;" :size="32" @click="isSpeech = !isSpeech">
                <Microphone v-if="!isSpeech" />
                <svg v-else t="1757039432954" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="9091" width="200" height="200">
                    <path
                        d="M512 61.44C263.168 61.44 61.44 263.168 61.44 512s201.728 450.56 450.56 450.56 450.56-201.728 450.56-450.56S760.832 61.44 512 61.44z"
                        fill="#FFFFFF" p-id="9092"></path>
                    <path
                        d="M512 61.44c248.832 0 450.56 201.728 450.56 450.56s-201.728 450.56-450.56 450.56S61.44 760.832 61.44 512 263.168 61.44 512 61.44z m0 61.44C297.10336 122.88 122.88 297.10336 122.88 512s174.22336 389.12 389.12 389.12 389.12-174.22336 389.12-389.12S726.89664 122.88 512 122.88z m174.08 573.44a30.72 30.72 0 0 1 0 61.44h-348.16a30.72 30.72 0 0 1 0-61.44h348.16zM327.68 491.52a61.44 61.44 0 1 1 0 122.88 61.44 61.44 0 0 1 0-122.88z m184.32 0a61.44 61.44 0 1 1 0 122.88 61.44 61.44 0 0 1 0-122.88z m184.32 0a61.44 61.44 0 1 1 0 122.88 61.44 61.44 0 0 1 0-122.88z m-368.64-184.32a61.44 61.44 0 1 1 0 122.88 61.44 61.44 0 0 1 0-122.88z m184.32 0a61.44 61.44 0 1 1 0 122.88 61.44 61.44 0 0 1 0-122.88z m184.32 0a61.44 61.44 0 1 1 0 122.88 61.44 61.44 0 0 1 0-122.88z"
                        fill="#131415" p-id="9093"></path>
                </svg>
            </el-icon>
            <div v-if="isSpeech" class="mike-box" @mousedown="handleStart" @mouseup="handleStop"
                @touchstart="handleStart" @touchend="handleStop" @touchcancel="handleStop">
                <el-button :disabled="isSpeaker">按住说话</el-button>
            </div>
            <el-input :disabled="isSpeaker" v-else :placeholder="$at('请输入')" v-model="input" @keydown="handleEnter">
                <template #append>
                    <el-button :icon="Position" type="primary" @click="handleSend" />
                </template>
            </el-input>
            <el-icon :size="32" style="cursor: no-drop;">
                <VideoCamera />
            </el-icon>

        </div>
        <div class="mask" v-show="isRecording" @mouseup="handleStop">
            <div class="mike">
                <div class="sound">
                    <img src="/image/sound.gif">
                </div>
                <span>松开发送</span>
                <div class="mike-content">
                    <el-icon style="cursor: pointer;" :size="32" color="#fff">
                        <Microphone />
                    </el-icon>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import { Position, UserFilled } from "@element-plus/icons-vue";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import { eq } from 'lodash';
const { chattingAi, chatHistory, page } = storeToRefs(useTalkieStore());
const route = useRoute();
const { isMobile } = useDevice();
const { width } = useMainWidth();
const maskWidth = ref(0);
watch(width, (newVal) => maskWidth.value = isMobile.value ? newVal : newVal * 0.4);
const msgClass = computed(() => {
    if (isMobile.value) return "";
    return isShowMsg.value ? "msgshow" : "msgunshow";
});
const isShowMsg = defineModel("isShowMsg", {
    type: Boolean,
    default: true
});
const chatFloat = defineModel("chatFloat", {
    type: Array,
    default: () => []
});
const avatar: any = inject('avatar');
const { startRecording, stopRecording, sendMessage, wsMsg, isSpeaker } = useAudio(avatar);
const messagesRef = ref<any>(null);
const input = ref<string>('');
let loadingHistory = false;
const isSpeech = ref<boolean>(false);
const isRecording = ref<boolean>(false);
const renderList = computed(() => [...chatHistory.value].reverse().map(e => {
    if (e.role !== 'user') return e;
    let parsedContent = e.content;
    const parsed = JSON.parse(e.content)
    parsedContent = parsed.content
    return { ...e, content: parsedContent }
}));

watch(() => wsMsg.value, async (newVal) => {
    if (newVal) {
        chatHistory.value.unshift(newVal);
        chatFloat.value.push(newVal);
        nextTick(() => {
            if (messagesRef.value) {
                messagesRef.value.$el.scrollTop = messagesRef.value.$el.scrollHeight;
            };
        });
    };
});
watch(() => route.params.id, async (newVal) => {
    if (newVal) {
        page.value = 1;
        await useTalkieStore().getHistory();
        await useTalkieStore().getChatting(route.params.id as string);
    };
});
const handleEnter = (e: KeyboardEvent | Event) => {
    if (e instanceof KeyboardEvent && eq(e?.key, 'Enter') && !eq(input.value, "")) {
        sendMessage({ type: "text", data: input.value });
        input.value = '';
    };
};
const handleSend = () => {
    sendMessage({ type: "text", data: input.value });
    input.value = '';
}
const handleStart = () => {
    isRecording.value = true;
    startRecording();
};
const handleStop = () => {
    setTimeout(() => {
        isRecording.value = false;
        stopRecording();
    }, 200);
};
async function handleScroll(e: Event) {
    const el = e.target as HTMLElement;
    if (el.scrollTop === 0) {
        loadHistory();
    };
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
onMounted(async () => {
    await useTalkieStore().getHistory()
    nextTick(() => {
        if (messagesRef.value) {
            messagesRef.value?.scrollToBottom();
        };
    });
})
</script>
<style scoped lang="scss">
$msg-w: 40%;

@mixin msgW($old, $new) {
    width: #{$old};

    @media (max-width: 768px) {
        width: #{$new};
    }
}

.navbar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding: 0 20px;
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
}

.msg {
    width: #{$msg-w};
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    padding: 20px 0;
    box-sizing: border-box;
    position: relative;

    @media (max-width: 768px) {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        padding: 0;
        background: transparent;

    }

    .msg-bg {
        background: url("/image/purple-bg.avif") top / cover no-repeat;
        filter: blur(100px);
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        opacity: .5;
        z-index: 0;

        @media (max-width: 768px) {
            display: none;
        }

    }

    .ai-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: auto;
        z-index: 1;

        h4 {
            margin: 10px 0;
        }
    }

    .content {
        margin-top: 28px;
        width: 100%;
        height: calc(100% - 118px);
        padding-bottom: 20px;
        box-sizing: border-box;
        overflow-y: auto;

        @media (max-width: 768px) {
            height: 55%;
            margin-top: auto;
            background: rgba(18, 18, 20, .9);
            mask-image: linear-gradient(0deg,
                    rgba(0, 0, 0, 1) 90%,
                    rgba(0, 0, 0, 0) 100%);
            -webkit-mask-image: linear-gradient(0deg,
                    rgba(0, 0, 0, 1) 90%,
                    rgba(0, 0, 0, 0) 100%);
            transition: mask-size .2s ease, -webkit-mask-size .2s ease;
        }

        .msg_item {
            height: 100%;

            .msg_item_content {
                margin: 0 auto;
                width: calc(80% + 60px);
                display: flex;
                align-items: start;
                margin-bottom: 10px;

                p {
                    max-width: 80%;
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

    .tail {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        @media (max-width: 768px) {
            padding-bottom: 20px;
        }

        .el-icon {
            background: #737373;
            padding: 5px;
            border-radius: 50%;
        }

        .el-input {
            width: 80%;
            text-align: center;
            height: 40px;
            box-sizing: border-box;
            padding: 0 10px;
            background: transparent;
            margin: 0 10px;


        }
    }
}

.msgunshow {
    animation: msgBoxUnShow 0.3s ease forwards;

    @keyframes msgBoxUnShow {
        from {
            width: $msg-w;
        }

        to {
            width: 0%;
            display: none;
        }
    }
}

.msgshow {
    animation: msgBoxShow 0.3s ease forwards;

    @keyframes msgBoxShow {
        from {
            width: 0%;
        }

        to {
            @include msgW(40%, 100%);
        }
    }
}

.mike-box {
    position: relative;
    width: 80%;
    height: 40px;
    margin: 0 10px;

    .el-button {
        width: 100%;
        height: 100%;
    }
}

.mask {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    // background: rgba(0, 0, 0, 0.5);
    z-index: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.mike {
    // margin-top: auto;
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    z-index: 1;
    overflow: hidden;
    left: 0;
    bottom: -50px;
    position: absolute;

    span {
        color: #fff;
        margin: 20px 0;
    }

    .sound {
        width: 200px;
        height: 50px;
        background-color: #fff;
        padding: 10px 20px;
        box-sizing: border-box;
        border-radius: 10px;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

    }

    .mike-content {
        height: 10rem;
        left: 0;
        position: fixed;
        width: 100%;
        z-index: 999;
        position: relative;


        &::before {
            background: linear-gradient(252deg, #615ced, #8884f6);
            border: .25rem solid #c6c4ff;
            border-radius: 50%;
            content: "";
            display: inline-block;
            height: 15rem;
            left: 50%;
            position: absolute;
            transform: translateX(-50%);
            width: 45rem;
        }

        .el-icon {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    }

}
</style>
