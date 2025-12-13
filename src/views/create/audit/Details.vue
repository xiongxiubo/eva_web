<template>
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" :width="width" :center="true">
        <el-descriptions :title="$at('模型详情')" border direction="vertical" :column="column">
            <el-descriptions-item :width="140" :rowspan="2" :label="$at('图片')" align="center">
                <el-image style="width: 100px; height: 100px" :src="current.images" :preview-src-list="[current.images]"
                    preview-teleported fit="contain" />
            </el-descriptions-item>
            <el-descriptions-item :label="$at('模型名称')" :width="100">{{ current.name }}</el-descriptions-item>
            <el-descriptions-item :label="$at('欢迎语')">{{ current.welcome_text }}</el-descriptions-item>
            <el-descriptions-item :label="$at('审核状态')">
                <el-tag :type="getStatusTagType(current.status)">
                    {{ getStatusName(current.status) }}
                </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$at('语音信息')">
                语音名称：{{ current.voice.name }}
                语音ID：{{ current.voice.voice_type }}
            </el-descriptions-item>
            <el-descriptions-item :label="$at('描述')" :span="3">{{ current.description }}</el-descriptions-item>
            <el-descriptions-item :label="$at('提示词')" :span="3">{{ current.prompt }}</el-descriptions-item>
            <el-descriptions-item :label="$at('拒绝原因')" :span="3">
                <p style="color: #f44336;">{{ current.comments || $at('暂未审核') }}</p>
            </el-descriptions-item>
        </el-descriptions>
        <template #footer v-if="route.path === '/create/audit'">
            <el-button type="primary" @click="router.push(`/create/edit?id=${current.id}`)">
                {{ $at('修改') }}
            </el-button>
        </template>
    </el-dialog>

</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
const router = useRouter();
const route = useRoute();
const { isMobile } = useDevice();
const width = computed(() => isMobile.value ? '95%' : '600px');
const column = computed(() => isMobile.value ? 2 : 3);
const detailDialogVisible = defineModel({
    default: false,
    type: Boolean,
});
defineProps({
    current: {
        default: () => ({}),
        type: Object,
    },
})
// 获取状态标签类型
const getStatusTagType = (status: string): "primary" | "success" | "warning" | "info" | "danger" => {
    const statusMap: Record<string, "primary" | "success" | "warning" | "info" | "danger"> = {
        'pending': 'warning',
        'passed': 'success',
        'rejected': 'danger'
    };
    return statusMap[status] || 'info';
};

// 获取状态名称
const getStatusName = (status: string) => {
    const nameMap: Record<string, string> = {
        'pending': '待审核',
        'passed': '已通过',
        'failed': '已拒绝'
    };
    return nameMap[status] || status;
};
</script>
<style scoped lang="scss"></style>
