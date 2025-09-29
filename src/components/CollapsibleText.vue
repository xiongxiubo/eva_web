<template>
    <div class="clamp-box">
        <div class="clamp-inner">
            <!-- 文本部分 -->
            <div ref="contentRef" class="clamp-text"
                :style="{ maxHeight: expanded ? contentHeight + 'px' : collapsedHeight + 'px' }">
                <slot />
            </div>

            <!-- 按钮部分 -->
            <span v-if="showButton" class="toggle-icon" @click="toggle">
                <el-icon v-if="!expanded">
                    <ArrowDown />
                </el-icon>
                <el-icon v-else>
                    <ArrowUp />
                </el-icon>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from "vue";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";

const props = defineProps({
    lines: { type: Number, default: 1 },       // 折叠时显示行数
    lineHeight: { type: Number, default: 22 }, // 行高 px
    transition: { type: Number, default: 300 } // 动画时长
});

const expanded = ref(false);
const contentRef = ref<HTMLElement | null>(null);
const contentHeight = ref(0);
const showButton = ref(false);

const collapsedHeight = computed(() => props.lines * props.lineHeight);

async function measure() {
    await nextTick();
    const el = contentRef.value;
    if (!el) return;
    const prev = el.style.maxHeight;
    el.style.maxHeight = "none";
    contentHeight.value = el.scrollHeight;
    el.style.maxHeight = prev || "";
    showButton.value = contentHeight.value > collapsedHeight.value + 1;
}

const toggle = () => {
    expanded.value = !expanded.value;
};

let ro: ResizeObserver | null = null;
onMounted(() => {
    measure();
    ro = new ResizeObserver(() => measure());
    if (contentRef.value) ro.observe(contentRef.value);
    window.addEventListener("resize", measure);
});
onBeforeUnmount(() => {
    ro?.disconnect();
    window.removeEventListener("resize", measure);
});
</script>

<style scoped lang="scss">
.clamp-box {
    background: #000;
    color: #fff;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    width: 80%;
}

.clamp-inner {
    display: flex;
    align-items: flex-start;
}

.clamp-text {
    overflow: hidden;
    transition: max-height v-bind('props.transition + "ms"') ease;
    flex: 1;
    /* 占满剩余空间 */
}

.toggle-icon {
    cursor: pointer;
    margin-left: 6px;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    /* 防止被压缩 */
    color: #fff;
}
</style>
