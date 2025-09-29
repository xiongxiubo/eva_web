<template>
    <el-drawer v-model="isCollapse" direction="ltr" class="demo-drawer" :show-close="false" :size="240"
        :with-header="false">
        <el-menu style="height: 100%;width: 200px;" router :default-active="route.path">
            <Menu />
        </el-menu>
    </el-drawer>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import Menu from '@/components/menu.vue';
const storage = useUserStore();
const { isCollapse } = storeToRefs(storage);
const route = useRoute();

</script>
<style scoped lang="scss">
.navbar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    box-sizing: border-box;

    img {
        flex-shrink: 0;
        margin-right: 10px;
        width: 24px;
        height: 24px;
    }

    .vip {
        flex-shrink: 0;
        width: 50px;
        height: 32px;
        background-color: hsla(0, 0%, 100%, .06);
        border: .5px solid hsla(0, 0%, 100%, .1);
        border-radius: 16px;
        margin-left: 10px;
    }
}

.logo {
    width: 100%;
    height: 64px;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .logoCollapsed {
        width: 32px;
        height: 32px
    }

    .logoExpanded {
        width: 92px;
        height: 24px;
    }
}


.el-menu {
    display: flex;
    flex-direction: column;
    border: 0;
}

.chat-title {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    padding: 12px 20px;
    box-sizing: border-box;

}

.chat-list {
    width: 100%;
    height: calc(100% - 240px);
    overflow-y: auto;

    .chat-item {
        width: 100%;
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        box-sizing: border-box;
        cursor: pointer;

        span {
            font-size: 14px;
            font-weight: 500;
            color: #fff;
            margin-left: 10px;
        }

    }
}

.foot {
    border-top: 1px solid #b6afaf;
    width: 100%;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: auto;
}
</style>
