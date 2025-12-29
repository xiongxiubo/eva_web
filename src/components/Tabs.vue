<template>
    <div class="tabs-wrapper">
        <div class="tabs-container">
            <div v-for="tab in tabList" :key="tab.value" :ref="(el) => setTabRef(el, tab.value)" class="tab-item"
                :class="{ active: activeTab === tab.value }" @click="handleTabClick(tab.value)">
                {{ tab.label }}
            </div>
            <div class="active-line" :style="lineStyle"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 定义数据结构
interface TabItem {
    label: string;
    value: string;
}
const props = defineProps({
    tabList: {
        type: Array as PropType<TabItem[]>,
        default: () => [],
    }
})

const activeTab = defineModel({
    type: String,
    default: () => '',
}); // 当前激活项
const tabRefs = new Map<string, HTMLElement>(); // 存储 DOM 引用

// 下划线样式状态
const lineStyle = reactive({
    width: '0px',
    transform: 'translateX(0px)',
});

// 设置 ref 的方法
const setTabRef = (el: any, value: string) => {
    if (el) tabRefs.set(value, el);
};

// 计算下划线位置的方法
const updateLine = async () => {
    await nextTick(); // 等待 DOM 更新
    const activeEl = tabRefs.get(activeTab.value);
    if (activeEl) {
        const { offsetLeft, offsetWidth } = activeEl;
        // 下划线通常比文字稍短一点，可以根据需要调整计算方式
        lineStyle.width = `${offsetWidth}px`;
        lineStyle.transform = `translateX(${offsetLeft}px)`;
    }
};

const handleTabClick = (value: string) => {
    activeTab.value = value;
};
// 监听 activeTab 变化，触发位置更新
watch(activeTab, () => { updateLine() });

// 初始化位置
onMounted(() => {
    updateLine();
});
</script>

<style lang="scss" scoped>
@use "sass:color";
$text-inactive: #666666; // 未激活文字灰色
$transition-time: 0.3s;

.tabs-wrapper {
    padding: 20px;
    display: flex;
    align-items: center;
}

.tabs-container {
    position: relative;
    display: flex;
    gap: 32px; // Tab 之间的间距


    .tab-item {
        padding: 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: $text-inactive;
        cursor: pointer;
        transition: color $transition-time ease;
        user-select: none;

        &:hover {
            color: color.scale($text-inactive, $lightness: 20%);
        }

        &.active {
            color: var(--tab-active);
        }
    }

    // 动态下划线样式
    .active-line {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background-color: var(--tab-active);
        transition: all $transition-time cubic-bezier(0.4, 0, 0.2, 1);
        // 使用 transform 性能更好，且方便做动态效果
    }
}

// 手机端自适应调整
@media (max-width: 600px) {
    .tabs-container {
        gap: 20px;

        .tab-item {
            font-size: 14px;
        }
    }
}
</style>