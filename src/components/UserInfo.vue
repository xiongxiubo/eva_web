<template>
    <el-dropdown>
        <div class="foot-user">
            <el-avatar :size="20">{{ user.username[0] }}</el-avatar>
            <span>{{ user.Address === "" ? user.Email : ellipsis(user.Address) }}</span>
        </div>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item @click="logout">
                    {{ $at('退出登录') }}
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import { ellipsis } from "@/utils/utils";
const { user, token } = storeToRefs(useUserStore());
const router = useRouter();

const logout = async () => {
    try {
        token.value = '';
        router.push('/login');
    } catch (error) {
        console.log(error);
    }
};
</script>
<style scoped lang="scss">
.foot-user {
    margin: 0 auto;
    display: flex;
    align-items: center;
    padding: 5px;
    background: var(--menu-foot-bg);
    border-radius: 8px;
    box-sizing: border-box;
    flex-shrink: 0;
    cursor: pointer;

    span {
        font-size: 14px;
        margin-left: 10px;
    }

    .el-avatar {
        flex-shrink: 0;
        border: 1px solid #fff;
    }

}
</style>