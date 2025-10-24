<template>
    <el-dropdown>
        <div class="foot-user">
            <el-avatar :src="user.Address === '' ? generateAvatar(user.Email) : generateAvatar(user.Address)"
                :size="20" />
            <span>{{ user.Address === "" ? user.Email : ellipsis(user.Address) }}</span>
        </div>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item @click="dialogTableVisible = true">
                    {{ $at('个人资料') }}
                </el-dropdown-item>
                <el-dropdown-item @click="logout">
                    {{ $at('退出登录') }}
                </el-dropdown-item>

            </el-dropdown-menu>
        </template>
    </el-dropdown>

    <Setup v-if="dialogTableVisible" v-model="dialogTableVisible" />
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import { generateAvatar, ellipsis } from "@/utils/utils";
import { useDisconnect } from "@reown/appkit/vue";

const dialogTableVisible = ref(false);

const { disconnect } = useDisconnect();
const { user, token } = storeToRefs(useUserStore());
const router = useRouter();

const logout = async () => {
    try {
        token.value = '';
        await disconnect();
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
    padding: 5px 15px;
    background: var(--el-menu-active-bg-color);
    border-radius: 8px;
    box-sizing: border-box;
    flex-shrink: 0;
    height: 36px;
    cursor: pointer;


    span {
        margin-left: 10px;
        font-size: 14px;
        line-height: 19px;
        font-weight: bold;
        font-family: Manrope, Inter, PingFangSC-Regular, "Microsoft YaHei", sans-serif;
    }

    .el-avatar {
        flex-shrink: 0;
    }

}
</style>