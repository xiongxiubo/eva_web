<template>
    <div class="header">
        <div class="header_menu">
            <el-icon :size="26" @click="isMobileMenuOpen = !isMobileMenuOpen">
                <Expand />
            </el-icon>
        </div>
        <div class="header_content">
            <Theme />
            <Lang />
            <UserInfo />
        </div>

    </div>
</template>
<script setup lang="ts">
const { isMobileMenuOpen } = storeToRefs(useCreationStore());
</script>
<style scoped lang="scss">
.header {
    width: 100%;
    height: 60px;
    background-color: var(--el-header-bg-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 30px;
    box-sizing: border-box;

    @media (max-width: 768px) {
        padding: 0 16px;
    }

    .header_content {
        display: flex;
        align-items: center;

    }
}
</style>
