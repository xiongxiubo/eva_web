<template>
    <div class="audio-player">
        <audio ref="audioRef" :src="src"></audio>
        <button class="play-btn" @click="togglePlay">
            <component :is="isPlaying ? VideoPause : VideoPlay" class="icon" />
        </button>
    </div>
</template>
<script setup lang="ts">
import { VideoPlay, VideoPause } from '@element-plus/icons-vue';

defineProps({
    src: {
        type: String,
    },
})

const audioRef = ref<HTMLAudioElement>();
const isPlaying = ref(false);

const togglePlay = () => {
    if (!audioRef.value) return;

    if (isPlaying.value) {
        audioRef.value?.pause();
    } else {
        audioRef.value?.play();
    }
};

const onPlay = () => (isPlaying.value = true);
const onPause = () => (isPlaying.value = false);

onMounted(() => {
    audioRef.value?.addEventListener('play', onPlay);
    audioRef.value?.addEventListener('pause', onPause);
});
onUnmounted(() => {
    audioRef.value?.removeEventListener('play', onPlay);
    audioRef.value?.removeEventListener('pause', onPause);
});
</script>
<style scoped lang="scss">
.play-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
}

.icon {
    width: 32px;
    height: 32px;
}
</style>
