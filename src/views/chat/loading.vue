<template>
    <div class="loading">
        <div class="loading-spinner">
            <el-avatar :src="chattingAi?.avatar" :size="150" />
            <h2>{{ chattingAi?.name }}</h2>
        </div>
        <div class="loading-text">
            <span v-for="(item, index) in text" :key="index" :style="{ animationDelay: `${index * 0.2}s` }">
                {{ item }}
            </span>
        </div>
        <div class="fotter">
            <div class="btn-box">
                <div class="btn" @click="mute = !mute">
                    <el-icon :size="25" color="#737373">
                        <Microphone v-show="!mute" />
                        <Mute v-show="mute" />
                    </el-icon>
                </div>
                <p style="margin-top: 10px;">{{ $at('静音') }}</p>
            </div>

            <div class="btn-box">
                <div class="btn" @click="close">
                    <el-icon :size="30">
                        <svg t="1760955034116" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="4553" width="200" height="200">
                            <path
                                d="M57.856 600.106667a52.394667 52.394667 0 0 1 0-73.813334c245.674667-246.613333 645.034667-246.613333 891.648 0 20.266667 20.394667 20.266667 53.333333 0 73.770667l-89.514667 89.557333a51.84 51.84 0 0 1-73.301333 0.426667 411.562667 411.562667 0 0 0-101.973333-74.24 51.584 51.584 0 0 1-28.373334-46.464l-0.512-100.693333c-99.413333-29.781333-205.354667-29.866667-304.810666-0.170667v100.138667c-0.128 19.626667-11.093333 37.589333-28.586667 46.634666a394.154667 394.154667 0 0 0-101.589333 74.069334c-20.48 20.224-53.376 20.224-73.813334-0.042667l-89.173333-89.173333z"
                                fill="#F5222D" p-id="4554"></path>
                        </svg>
                    </el-icon>
                </div>
                <p style="margin-top: 10px;">{{ $at('挂断') }}</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { $at } from 'i18n-auto-extractor'
const mute = ref(false)
const emit = defineEmits(['close'])
const { chattingAi } = storeToRefs(useTalkieStore())
const close = () => {
    emit('close')
}
const text = computed(() => {
    return `${$at('正在接通')} ${chattingAi.value?.name}...`
})
watch(mute, (newVal) => {
    if (newVal) {
        audio.value.volume = 0;
    } else {
        audio.value.volume = 0.2;
    }
})
const audio = ref(new Audio('/mp3/phone_ringing.mp3'));

onMounted(() => {
    // 播放MP3音频 // 循环播放 调整音量
    audio.value.loop = true;
    audio.value.volume = 0.2;
    audio.value.play();
})
onUnmounted(() => {
    // 关闭音频播放
    audio.value.pause();
    audio.value.currentTime = 0;
})
</script>
<style scoped lang="scss">
.loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--chat-loading-backgroud);
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    z-index: 2000;
    text-align: center;
    box-sizing: border-box;
    color: #fff;
    padding: 9%;

    .loading-text {
        // margin-top: 20px;
        display: inline-block;
        font-weight: bold;
        letter-spacing: 2px;

        span {
            display: inline-block;
            opacity: 0;
            transform: translateY(20px);
            animation: jumpIn 0.6s ease forwards, jumpLoop 1.5s ease-in-out infinite;
            animation-delay: var(--delay, 0s);
        }
    }

    .el-button {
        width: 60px;
        height: 60px;
        font-size: 30px;
    }
}

.fotter {
    // margin-top: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 140px;
}

p {
    color: #d5dce5;
}

.btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;

}

@keyframes jumpLoop {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-8px);
    }
}

@keyframes jumpIn {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }

    60% {
        opacity: 1;
        transform: translateY(-10px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>