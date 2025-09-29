<template>
    <div class="main-page">
        <Navbar v-if="isMobile" />
        <slot></slot>
    </div>
</template>
<script setup lang="ts">
import Navbar from '@/components/navbar.vue'
import { useDevice } from '@/hooks/useDevice';
const { isMobile } = useDevice();

</script>
<style scoped lang="scss">
.main-page {
    width: 100%;
    max-width: 1680px;
    margin: 0 auto;

    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
