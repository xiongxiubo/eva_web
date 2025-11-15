<template>
    <div class="common-layout">
        <el-container style="height: 100%;">
            <el-aside :width="isCollapse ? '0px' : '200px'" v-if="!isMobile">
                <el-menu style="height: 100%;" router :default-active="route.path">
                    <Menu />
                </el-menu>
            </el-aside>
            <el-container>
                <el-header>
                    <Header />
                </el-header>
                <el-main class="main">
                    <router-view :key="$route.fullPath" />
                </el-main>
            </el-container>
        </el-container>
        <NoUsername />
    </div>
</template>
<script setup lang="ts">
import Menu from '@/components/menu.vue';
import Header from './header.vue';
import { useDark } from '@vueuse/core';

const isDark = useDark();
const route = useRoute();
const { isMobile } = useDevice();
const storage = useUserStore();
const { isCollapse } = storeToRefs(storage);

onMounted(() => {
    storage.getChatList();
});
</script>
<style scoped lang="scss">
.common-layout {
    height: 100%;
}

.main {
    width: 100%;
    padding: 0;
    background: var(--main-bg);

    img {
        width: 24px;
        height: 24px;
        position: absolute;
        top: 16px;
        left: 0px;
        z-index: 1999;
    }
}

.el-menu {
    display: flex;
    flex-direction: column;
}
</style>
