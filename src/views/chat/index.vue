<template>
    <div class="chat">
        <div class="avatar" ref="avatar" v-clean-canvas />
        <div class="bg" />
        <Msg />
    </div>
</template>
<script setup lang="ts">
import Msg from '@/views/chat/msg.vue'
const avatar = ref<HTMLDivElement | null>(null);
provide('avatar', avatar);
</script>
<style scoped lang="scss">
.chat {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    position: relative;
    background: var(--chat-loading-backgroud);

    @media (max-width: 768px) {
        display: block;
        position: relative;
    }

    .avatar {
        width: 100%;
        height: calc(100% - 100px);
        // background: url("/image/purple-bg.avif") top / cover no-repeat;
        position: relative;
        background-position: 80%;
        z-index: 10;

        @media (max-width: 768px) {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1;

        }
    }
}
</style>
