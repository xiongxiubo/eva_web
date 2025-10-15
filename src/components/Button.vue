<template>
    <el-button :icon="icon" :type="type" @click="handleClick" :loading="loading">
        <slot></slot>
    </el-button>
</template>
<script setup lang="ts">
defineProps<{
    icon?: Component | string
    type: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | '' | 'text'
}>()
const emit = defineEmits<{
    (e: 'submit'): Promise<void> | void
}>()
const loading = ref<boolean>(false)

const handleClick = async () => {
    loading.value = true
    const result = emit('submit')
    console.log(result);
    // 如果父组件返回的是 Promise，可以等待它
    if (result instanceof Promise) {
        await result
    }

    loading.value = false
}
</script>
