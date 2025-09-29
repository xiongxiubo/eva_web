<template>
    <div class="chat">
        <div class="avatar" ref="avatar" v-clean-canvas
            :class="{ 'avatarMsg': (isShowMsg && !isMobile), 'avatarUnmsg': (!isShowMsg || isMobile) }">
            <div class="textfloat" v-show="!isShowMsg || isMobile">
                <div v-for="item in chatFloat" class="textfloat-content"
                    :class="item.role === 'user' ? 'user' : 'chat'">
                    {{ item.content }}
                </div>
            </div>
            <el-icon :size="24" color="#fff" v-show="!isShowMsg" @click="isShowMsg = true"
                style="position: absolute; right: 10px; top: 32px; cursor: pointer;">
                <Fold />
            </el-icon>
        </div>
        <div class="bg" />
        <Msg v-model:is-show-msg="isShowMsg" v-model:chat-float="chatFloat" />
    </div>
</template>
<script setup lang="ts">
import Msg from '@/views/chat/msg.vue'
const { isMobile } = useDevice();
const isShowMsg = ref<boolean>(true);
const avatar = ref<HTMLDivElement | null>(null);
const chatFloat = ref<any[]>([]);
provide('avatar', avatar);
</script>
<style scoped lang="scss">
.avatarUnmsg {
    animation: unmsg 0.3s ease forwards;

    @keyframes unmsg {
        to {
            width: 100%
        }

        from {
            width: 60%
        }
    }
}

.avatarMsg {
    animation: msg 0.3s ease forwards;

    @keyframes msg {
        to {
            width: 60%
        }

        from {
            width: 100%
        }
    }
}

$msg-w: 40%;

.chat {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    position: relative;

    @media (max-width: 768px) {
        display: block;
        position: relative;
    }

    .avatar {
        width: calc(100% - #{$msg-w});
        height: 100%;
        background: url("/image/purple-bg.avif") top / cover no-repeat;
        position: relative;
        background-position: 80%;

        @media (max-width: 768px) {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1;

        }

        .textfloat {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 70%;
            z-index: 2;
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

    }
}
</style>
