<template>
    <div class="sound-wave-bg">
        <div v-for="(bar, i) in bars" :key="i" class="bar" :style="{ animationDelay: `${i * 0.1}s` }"></div>
    </div>
</template>

<script setup>
const barCount = 160 // 音浪柱数量
const bars = Array.from({ length: barCount })
</script>

<style lang="scss" scoped>
.sound-wave-bg {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    width: 100%;
    height: 100px;
    gap: 6px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .bar {
        width: 4px;
        height: 20px;
        border-radius: 2px;
        background-image: repeating-linear-gradient(to bottom,
                #3b82f6,
                #3b82f6 4px,
                transparent 4px,
                transparent 8px); // 每4px为一段蓝色，间隔4px透明形成虚线
        animation: waveBounce 1.2s infinite ease-in-out;
    }
}

/* 音浪跳动动画 */
@keyframes waveBounce {

    0%,
    100% {
        height: 20px;
        transform: scaleY(0.4);
        opacity: 0.7;
    }

    50% {
        height: 100px;
        transform: scaleY(1);
        opacity: 1;
    }
}
</style>
