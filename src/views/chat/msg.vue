<template>
    <div class="msg" ref="msgRef">
        <div class="textfloat">
            <div v-for="item in chatFloat" class="textfloat-content" :class="item.role === 'user' ? 'user' : 'chat'">
                {{ item.content }}
            </div>
        </div>
        <div class="tail">
            <div v-if="isSpeech" class="msg-input" @mousedown="handleStart" @mouseup="handleStop"
                @touchstart="handleStart" @touchend="handleStop" @touchcancel="handleStop">
                <el-button v-show="!isRecording" class="msg-input-btn" :disabled="isSpeaker">{{
                    $at('按住说话') }}</el-button>
                <div v-show="isRecording" class="recording">
                    <el-button class="msg-input-btn" :disabled="isSpeaker">
                        {{ formattedTime }}
                    </el-button>
                    <div v-for="n in 3" :key="n" class="wave" :style="{ animationDelay: `${n * 0.6}s` }"></div>
                </div>
            </div>
            <div class="msg-input" v-else>
                <input type="text" v-model="input" :placeholder="`${$at('向')}${chattingAi.name} ${$at('发送消息')} `"
                    @keydown="handleEnter" :disabled="isSpeaker">
                <el-button :icon="Position" type="primary" @click="handleSend" circle />
            </div>
            <el-icon style="cursor: pointer;" :size="28" @click="isSpeech = !isSpeech">
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
        </div>
        <p @click="isSpan = !isSpan">这是人工智能聊天机器人，不是真人。请将其所说的一切视为虚构。<span v-show="isSpan">其所说内容不应被视为事实或建议。</span> </p>
    </div>
    <Loading v-if="loading" @close="closeLoading" />
</template>
<script setup lang="ts">
import Loading from './loading.vue'
import { $at } from 'i18n-auto-extractor';
import { Position } from "@element-plus/icons-vue";
import { eq } from 'lodash';
import router from '@/router';
import { useAudio } from '@/hooks/newHead/useAudio';
const route = useRoute();
const { chattingAi } = storeToRefs(useTalkieStore());
const isSpan = ref<boolean>(false);
const chatFloat = ref<any[]>([]);
const avatar: any = inject('avatar');
const { startRecording, stopRecording, sendMessage, close, formattedTime, wsMsg, isSpeaker, loading } = useAudio(avatar);
const input = ref<string>('');
const isSpeech = ref<boolean>(false);
const isRecording = ref<boolean>(false);

const closeLoading = () => {
    close();
    router.back();
}
watch(() => wsMsg.value, async (newVal) => {
    if (newVal) {
        if (newVal.role === 'user') {
            try {
                newVal.content = JSON.parse(newVal.content).content;
            } catch (error) {
                newVal.content = newVal.content;
            }
        }
        chatFloat.value.push(newVal);
    };
});
watch(() => route.params.id, async (newVal) => {
    if (newVal) {
        await useTalkieStore().getChatting();
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
</script>
<style scoped lang="scss">
.textfloat {
    position: absolute;
    left: 0;
    bottom: 50px;
    width: 100%;
    height: 70%;
    z-index: 1;
    overflow: hidden;

    .textfloat-content {
        position: absolute;
        max-width: 80%;
        height: auto;
        display: flex;
        align-items: center;
        background: linear-gradient(0deg, #737373, #737373), rgba(48, 48, 46, .9);
        padding: 10px;
        word-wrap: break-word;
        opacity: 1;
        animation: floatup 8s ease-out forwards;
    }

    @keyframes floatup {
        0% {
            bottom: 0;
            opacity: 1;
        }

        100% {
            bottom: 100%;
            opacity: 0;
        }
    }

    .user {
        border-radius: 12px 2px 16px 12px;
        right: 20px;
    }

    .chat {
        border-radius: 2px 12px 12px 16px;
        height: auto;
        left: 20px;
    }
}

.msg {
    width: 100%;
    max-width: 680px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    z-index: 2;
    padding: 0;
    background: transparent;

    .tail {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 11;
        gap: 10px;

        .el-icon {
            background: #fff;
            color: #202024;
            padding: 5px;
            border-radius: 50%;
            border: 1px solid #d9d9df;
        }



        .msg-input {
            width: 80%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--msg-input-bg-color);
            border: 1px solid var(--msg-input-border-color);
            padding: 4px;
            border-radius: calc(4rem - 4px);
            display: flex;

            &:active {
                background: #5b82e0;
            }

            .recording {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

                /* 波纹圈 */
                .wave {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    border: 3px solid #60a5fa;
                    border-radius: 50%;
                    opacity: 0;
                    animation: waveExpand 1.8s ease-out infinite;
                }

                @keyframes waveExpand {
                    0% {
                        transform: scale(1);
                        opacity: 0.8;
                    }

                    100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            }

            input {
                width: 100%;
                height: 40px;
                box-sizing: border-box;
                padding: 0 10px;
                background: transparent;
                margin: 0 10px;
                border: 0;

                &:focus {
                    outline: none;
                    border: none;
                }
            }

            .msg-input-btn {
                width: 100%;
                background: transparent;
                border: 0;
                height: 40px;

            }

            .el-button {
                --el-color-primary: var(--msg-input-btn-color);
                // background-color: #202024;
            }
        }


    }

    p {
        font-size: .7rem;
        color: var(--msg-p-color);
        text-align: center;
        padding: 10px;
    }
}

.mask {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    // background: rgba(0, 0, 0, 0.5);
    z-index: 11;
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
