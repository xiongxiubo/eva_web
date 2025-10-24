<template>
    <el-form-item :prop="prop">
        <label v-if="label">{{ label }}</label>
        <input v-model="inputValue" :placeholder="placeholder" :type="type" :min="min" :max="max" />
    </el-form-item>
</template>
<script setup lang="ts">
const props = defineProps({
    prop: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 999
    }
});
const inputValue = defineModel({
    default: ''
});
</script>
<style scoped lang="scss">
.el-form-item {
    position: relative;

    input {
        height: 56px;
        width: 100%;
        padding: 0 14px;
        background: #262626;
        border: 2px solid #4D4D4D;
        border-radius: 8px;
        color: #fff;
    }

    label {
        position: absolute;
        top: -7px;
        left: 12px;
        z-index: 4;
        height: 16px;
        padding: 0 4px;
        background: #262626;
        font-size: 13px;
        font-weight: 450;
        line-height: 14px;
        color: rgba(255, 255, 255, 0.75);
    }
}
</style>