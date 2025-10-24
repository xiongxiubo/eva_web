<template>
    <el-dialog :title="$at('请设置用户名')" v-model="dialogVisible" :show-close="false" :close-on-click-modal="false"
        :close-on-press-escape="false" :align-center="true" :width="360">
        <FormItem :placeholder="$at('请输入用户名')" v-model="username" :min="3" :max="30" />
        <template #footer>
            <el-button type="primary" @click="submitForm">确定</el-button>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import { useUserStore } from '@/stores/user';
import { eq } from 'lodash';
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const dialogVisible = ref(false);
const username = ref('');

const submitForm = async () => {
    if (username.value === '') {
        ElMessage.error($at('请输入用户名'));
        return;
    }
    const res = await updateUserInfo({
        username: username.value
    })
    if (eq(res.code, 0)) {
        ElMessage.success($at('设置成功'));
        await userStore.getUser();
        dialogVisible.value = false;
    } else {
        ElMessage.error(res.msg);
    }
}

onMounted(async () => {
    await userStore.getUser();
    if (user.value.username === '') {
        dialogVisible.value = true;
    }
});
</script>
<style scoped lang="scss">
.el-button {
    width: 100%;
    margin: 0 auto;
    display: block;
    height: 36px;
    border-radius: 8px;
}
</style>
