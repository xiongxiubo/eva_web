<template>
    <div :class="{ 'dragover': isDragOver }" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop" @click="triggerInput">
        <el-icon :size="24"><upload-filled /></el-icon>
        <h4 class="upload-title-text">{{ $at('拖放文件或浏览') }}</h4>
        <p>{{ File?.name || $at('最大文件大小: 200 MB, 持续时间: 10-60 秒.') }}</p>
        <input ref="fileInput" type="file" class="hidden-input" accept=".mp3, .wav" @change="onFileChange" />
    </div>
</template>

<script setup lang="ts">
import { $at } from "i18n-auto-extractor";
import { eq } from "lodash";
const File = ref<File | null>(null);
const emits = defineEmits(['change']);
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement>();
const triggerInput = () => fileInput.value?.click();

const onDragOver = () => isDragOver.value = true;
const onDragLeave = () => isDragOver.value = false;

const onDrop = async (e: any) => {
    isDragOver.value = false;
    const files = e.dataTransfer.files;
    if (!files || !files.length) return;
    // 效验文件
    const valid = await validateFile(files[0]);
    if (!valid) return;
    File.value = files[0];
    // 上传文件
    await upfile(files[0]);
}

const onFileChange = async (e: any) => {
    const file = e.target.files[0];
    // 效验文件
    const valid = await validateFile(file);
    if (!valid) return;
    File.value = file;
    // 上传文件
    await upfile(file);

}
// 上传文件
const upfile = async (file: File) => {
    const formData = new FormData();
    formData.append('file_type', 'useraudio');
    formData.append('file', file);
    try {
        const res = await fileUpload(formData);
        if (eq(res.code, 0)) {
            emits('change', res.data.url || '');
        } else {
            ElMessage.error(res.msg || $at('文件上传失败'));
        };
    } catch (error) {
        ElMessage.error($at('文件上传失败'))
    }
}
// 文件效验
const validateFile = async (file: File) => {
    const maxSize = 200 * 1024 * 1024 // 200 MB
    const minDuration = 10 // 10 seconds
    const maxDuration = 60 // 60 seconds
    console.log(file)
    if (file.size > maxSize) {
        ElMessage.error($at('文件大小不能超过 200 MB'))
        return false
    }
    const duration = await checkAudioDuration(file)
    if (duration < minDuration || duration > maxDuration) {
        ElMessage.error($at('音频时长必须在 10-60 秒之间'))
        return false
    }
    ElMessage.success($at('文件上传成功'))
    return true
}

// 读取音频时长
const checkAudioDuration = (file: File) => {
    return new Promise<number>((resolve) => {
        const url = URL.createObjectURL(file)
        const audio = new Audio()
        audio.src = url

        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration)
            URL.revokeObjectURL(url)
        })
    })
}
</script>

<style scoped>
.hidden-input {
    display: none;
}
</style>
