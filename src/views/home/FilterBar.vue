<template>
    <div class="filter-container">
        <div class="filter-wrapper">
            <div class="search-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M19.75 18.719l-4.188-4.188c.907-1.094 1.407-2.5 1.407-4.031 0-3.563-2.938-6.5-6.5-6.5C6.875 4 4 6.938 4 10.5c0 3.594 2.906 6.5 6.469 6.5 1.5 0 2.906-.5 4.031-1.406l4.188 4.187a.753.753 0 00.562.219.622.622 0 00.5-.219c.313-.281.313-.75 0-1.062zM5.5 10.5c0-2.75 2.219-5 5-5 2.75 0 5 2.25 5 5 0 2.781-2.25 5-5 5-2.781 0-5-2.219-5-5z">
                    </path>
                </svg>
                <input v-model="keyword" type="text" :placeholder="$at('输入想要聊天的ai名称')" />
            </div>

            <div class="actions-wrapper">
                <div class="aianace-select" ref="selectRef">
                    <!-- 触发器 (显示框) -->
                    <div class="select-trigger" :class="{ 'is-active': isOpen }" @click="toggleDropdown">
                        <div class="trigger-info">
                            <!-- 动态显示当前选中的图标 (插槽或默认) -->
                            <div class="icon-box" v-if="selectedOption?.icon" v-html="selectedOption.icon"></div>
                            <span class="label-text">{{ selectedOption?.name || $at("请选择标签") }}</span>
                        </div>
                        <!-- 旋转箭头 -->
                        <svg class="arrow-icon" :class="{ 'rotated': isOpen }" viewBox="0 0 20 20">
                            <path
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                    <!-- 下拉选项列表 -->
                    <transition name="fade-slide">
                        <ul class="options-list" v-if="isOpen">
                            <li v-for="item in tags" :key="item.value" class="option-item"
                                :class="{ 'is-selected': tags_type === item.value }"
                                @click="tags_type = item.value; isOpen = false;">
                                <div class="icon-box" v-if="item.icon" v-html="item.icon"></div>
                                <span>{{ item.name }}</span>
                                <!-- 选中时的对勾 (可选) -->
                                <span v-if="tags_type === item.value" class="check-mark">✓</span>
                            </li>
                        </ul>
                    </transition>
                </div>
                <div class="segmented-control">
                    <div class="slider-thumb"
                        :style="{ transform: isPrivate ? 'translateX(100%)' : 'translateX(0)' }" />
                    <div class="segment-item" :class="{ active: !isPrivate }" @click="isPrivate = false">
                        {{ $at('全部模型') }}
                    </div>
                    <div class="segment-item" :class="{ active: isPrivate }" @click="isPrivate = true">
                        {{ $at('我的模型') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
const store = useTalkieStore();
const { tagList, tags_type, isPrivate, keyword } = storeToRefs(store);
const tags = computed(() => [...tagList.value])
const isOpen = ref(false);
// 获取当前选中的对象
const selectedOption = computed(() => {
    return tags.value.find(option => option.value === tags_type.value) || tags.value[0];
});

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

onMounted(async () => {
    await store.getTag();
    isPrivate.value ? store.getAiPrivate() : store.getTalkie();
})
</script>

<style scoped lang="scss">
// 变量定义
$border-color: #525252; // neutral-600
$text-dim: #737373; // neutral-500
$text-icon: #a3a3a3; // neutral-400
$text-light: #e5e5e5; // neutral-200
$tooltip-bg: #262626; // neutral-800

.filter-container {
    width: 100%;
    padding: 1.25rem 0;

    .filter-wrapper {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;

        @media (min-width: 768px) {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    }

    // 搜索框样式
    .search-box {
        display: flex;
        height: 3rem;
        align-items: center;
        gap: 0.5rem;
        border-radius: 1.5rem;
        padding: 0.5rem 0.75rem;
        border: 1px solid $border-color;
        transition: border-color 0.2s;

        @media (min-width: 768px) {
            width: 360px;
        }

        &:hover {
            border-color: $text-dim;
        }

        svg {
            color: $text-dim;
            flex-shrink: 0;
        }

        input {
            width: 100%;
            border: none;
            outline: none;
            font-size: 0.875rem;
            background: transparent;

            &::placeholder {
                color: $text-dim;
                font-size: 0.75rem;

                @media (min-width: 640px) {
                    font-size: 0.875rem;
                }
            }
        }
    }

    // 右侧组合样式
    .actions-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 3rem;

        @media (max-width: 768px) {
            gap: 1.25rem;
        }

        @media (max-width: 1024px) {
            gap: 1.5rem;
        }
    }

    .icon-group {
        display: flex;
        align-items: center;
        gap: 1.25rem;

        @media (min-width: 1024px) {
            gap: 1.5rem;
        }
    }

    // 图标项及 Tooltip 逻辑
    .icon-item {
        position: relative;
        display: flex;
        height: 42px;
        width: 42px;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;

        .icon-btn {
            background: var(--icon-bg-color);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            cursor: pointer;
            transition: border-color 0.2s;
            padding: 4px;

            svg {
                transition: color 0.2s;
            }
        }
    }

    // FreeMint 切换按钮
    .toggle-btn {
        height: 2.5rem;
        width: 122px;
        cursor: pointer;
        border-radius: 20px;
        padding: 1px;
        border: 1px solid $border-color;
        transition: border-color 0.2s;


        .inner-content {
            display: flex;
            height: 100%;
            width: 100%;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;

            .circle {
                height: 1rem;
                width: 1rem;
                border-radius: 50%;
                border: 1px solid $text-dim;
                transition: all 0.2s;

                &.active {
                    background-color: green;
                }
            }

            .label {
                font-weight: 600;
                font-size: .8rem;
            }
        }


    }
}

.segmented-control {
    position: relative;
    display: flex;
    width: 240px;
    height: 40px;
    background-color: var(--segmented-control-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 20px;
    padding: 2px;
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);

    @media (max-width: 768px) {
        width: 160px;
    }

    /* 滑块：采用你截图中的深灰蓝色 */
    .slider-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: calc(50% - 2px);
        height: calc(100% - 4px);
        background-color: var(--segmented-thumb-bg-color);
        /* 选中项背景色 */
        border-radius: 18px;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1;
    }

    /* 选项文字 */
    .segment-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        color: #9499a1;
        /* 未选中时的灰色 */
        z-index: 2;
        transition: color 0.3s ease;
    }

    /* 选中后的文字颜色 */
    .segment-item.active {
        color: var(--segmented-item-active-color);
        /* 纯白 */
    }

    /* 悬停时的微亮效果 */
    .segment-item:hover:not(.active) {
        color: #cbd5e1;
    }
}

/* 容器 */
.aianace-select {
    position: relative;
    width: 240px;
    user-select: none;

    @media (max-width: 768px) {
        width: 160px;
    }

    /* 触发按钮 */
    .select-trigger {
        background-color: var(--segmented-control-bg-color);
        /* 截图中的背景色 */
        border: 1px solid var(--el-border-color);
        /* 截图中的边框色 */
        border-radius: 12px;
        height: 44px;
        padding: 0 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.25s ease;
    }

    .select-trigger:hover,
    .select-trigger.is-active {
        border-color: var(--select-trigger-hove-border-color);
        background-color: var(--select-trigger-hove-bg-color);
    }

    .trigger-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .label-text {
        font-size: 14px;
        font-weight: 500;
    }

    /* 图标容器 */
    .icon-box {
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        fill: #9499a1;
        /* 未选中图标颜色 */
    }

    /* 箭头 */
    .arrow-icon {
        width: 18px;
        height: 18px;
        fill: #5a5f66;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .arrow-icon.rotated {
        transform: rotate(180deg);
    }

    /* 下拉菜单列表 */
    .options-list {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        width: 100%;
        background-color: var(--segmented-control-bg-color);
        border: 1px solid var(--el-border-color);
        border-radius: 12px;
        padding: 6px;
        margin: 0;
        list-style: none;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
        z-index: 1000;
        box-sizing: border-box;
    }

    /* 选项条目 */
    .option-item {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        border-radius: 8px;
        color: #9499a1;
        font-size: 14px;
        cursor: pointer;
        gap: 10px;
        transition: all 0.2s ease;
    }

    .option-item:hover {
        background-color: var(--segmented-thumb-bg-color);
    }

    .option-item:hover .icon-box {
        fill: #ffffff;
    }

    .option-item.is-selected {
        color: #ffffff;
        background-color: rgba(45, 49, 57, 0.4);
    }

    .check-mark {
        margin-left: auto;
        font-size: 12px;
        color: #ffffff;
    }

    /* 动画效果 */
    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: all 0.2s ease;
    }

    .fade-slide-enter-from {
        opacity: 0;
        transform: translateY(-10px);
    }

    .fade-slide-leave-to {
        opacity: 0;
        transform: translateY(-5px);
    }
}
</style>