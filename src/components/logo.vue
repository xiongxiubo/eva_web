<template>
    <img :src="isDark ? '/image/logo_dark.png' : '/image/logo_light.png'" class="logoExpanded">
</template>
<script setup lang="ts">
import { useDark } from '@vueuse/core';
const isDark = useDark();
</script>
<style scoped lang="scss">
img {
    width: 50px;
    height: 50px;
}
</style>
