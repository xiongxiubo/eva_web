<template>
    <div class="header">
        <div class="header_content">
            <Theme />
            <Lang />
            <UserInfo />
        </div>

    </div>
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.header {
    width: 100%;
    height: 60px;
    background-color: var(--el-header-bg-color);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 30px;
    box-sizing: border-box;

    @media (max-width: 768px) {
        padding: 0 16px;
    }

    .header_content {
        display: flex;
        align-items: center;
        padding-top: 10px;
    }
}
</style>
