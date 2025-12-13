<template>
    <AVMedia :media="stream" type="wform" />
</template>
<script setup lang="ts">
import { AVMedia } from 'vue-audio-visual'
import { useUserMedia } from '@vueuse/core'

const { stream, start, stop } = useUserMedia({
    constraints: { audio: true },
})
onMounted(() => {
    start()
})
</script>

<style scoped lang="scss"></style>
