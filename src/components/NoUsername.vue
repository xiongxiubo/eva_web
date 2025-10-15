<template>
    <el-dialog title="请设置用户名" v-model="dialogVisible" :show-close="false" :close-on-click-modal="false"
        :close-on-press-escape="false" top="40vh">
        <el-input v-model="username" min-length="2" max-length="40" placeholder="请输入用户名" />
        <template #footer>
            <el-button type="primary" @click="submitForm">确定</el-button>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { eq } from 'lodash';
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const dialogVisible = ref(false);
const username = ref('');

const submitForm = async () => {
    if (username.value === '') {
        ElMessage.error('请输入用户名');
        return;
    }
    const res = await updateUserInfo({
        username: username.value
    })
    if (eq(res.code, 0)) {
        ElMessage.success('设置成功');
        await userStore.getUser();
        dialogVisible.value = false;
    }
}

onMounted(async () => {
    await userStore.getUser();
    if (user.value.username === '') {
        dialogVisible.value = true;
    }
});
</script>
