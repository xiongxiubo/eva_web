<template>
    <div class="darkWrap">
        <div class="darkItemS" v-if="!isDark" @click="toggle(true)">
            <el-icon :size="36">
                <svg viewBox="0 0 18 18" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" :d="svgIcon.light" fill="currentColor"></path>
                </svg>
            </el-icon>

        </div>
        <div class="darkItemD" v-if="isDark" @click="toggle(false)">
            <el-icon :size="36">
                <svg viewBox="0 0 18 18" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" :d="svgIcon.dark" fill="currentColor"></path>
                </svg>
            </el-icon>
        </div>

    </div>
</template>
<script setup lang="ts">
import svgIcon from "@/utils/svg"
import { useDark, useToggle } from '@vueuse/core';
const isDark = useDark();
const toggle = (bool: boolean) => {
    isDark.value = bool;
    useToggle(bool);
};
</script>
<style lang="scss" scoped>
.darkWrap {
    display: flex;
    align-items: center;

    .darkBoxS {
        display: flex;
        align-items: center;
        border-radius: 8px;
        cursor: pointer;
    }

    .darkItemS {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: #fff;
        padding: 2px;

    }

    .darkItemD {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: rgb(37, 40, 49);
        z-index: 5;
        padding: 2px;
    }
}
</style>