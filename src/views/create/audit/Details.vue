<template>
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="模型详情" width="600px" :center="true">
        <el-descriptions border direction="vertical">
            <el-descriptions-item :width="140" :rowspan="2" label="图片" align="center">
                <el-image style="width: 100px; height: 100px" :src="current.images" :preview-src-list="[current.images]"
                    preview-teleported fit="contain" />
            </el-descriptions-item>
            <el-descriptions-item label="模型名称" :width="100">{{ current.name }}</el-descriptions-item>
            <el-descriptions-item label="欢迎语">{{ current.welcome_text }}</el-descriptions-item>
            <el-descriptions-item label="审核状态">
                <el-tag :type="getStatusTagType(current.status)">
                    {{ getStatusName(current.status) }}
                </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="语音信息">
                语音名称：{{ current.voice.name }}
                语音ID：{{ current.voice.voice_type }}
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="3">{{ current.description }}</el-descriptions-item>
            <el-descriptions-item label="提示词" :span="3">{{ current.prompt }}</el-descriptions-item>
            <el-descriptions-item label="拒绝原因" :span="3">
                <p style="color: #f44336;">{{ current.comments }}</p>
            </el-descriptions-item>
        </el-descriptions>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="detailDialogVisible = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>

</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
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
