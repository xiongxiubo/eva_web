<template>
    <div class="filter-container">
        <div class="filter-wrapper">
            <div class="search-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M19.75 18.719l-4.188-4.188c.907-1.094 1.407-2.5 1.407-4.031 0-3.563-2.938-6.5-6.5-6.5C6.875 4 4 6.938 4 10.5c0 3.594 2.906 6.5 6.469 6.5 1.5 0 2.906-.5 4.031-1.406l4.188 4.187a.753.753 0 00.562.219.622.622 0 00.5-.219c.313-.281.313-.75 0-1.062zM5.5 10.5c0-2.75 2.219-5 5-5 2.75 0 5 2.25 5 5 0 2.781-2.25 5-5 5-2.781 0-5-2.219-5-5z">
                    </path>
                </svg>
                <input v-model="searchQuery" type="text" :placeholder="$at('输入想要聊天的ai名称')" />
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
                <!-- <div class="icon-group">
                    <div class="icon-item">
                        <el-dropdown>
                            <div class="icon-btn">
                                <el-icon :size="26">
                                    <svg t="1766544037464" viewBox="0 0 1024 1024" version="1.1"
                                        xmlns="http://www.w3.org/2000/svg" p-id="15391">
                                        <path
                                            d="M512.00768 623.93483c-173.247675 0-314.175411-139.967738-314.175411-311.967415C197.864269 139.967738 338.792005 0 512.00768 0s314.175411 139.967738 314.175411 311.999415c0 171.999678-140.927736 311.935415-314.175411 311.935415zM512.00768 63.99988c-137.695742 0-249.727532 111.263791-249.727532 247.999535s111.99979 247.967535 249.727532 247.967535 249.727532-111.231791 249.727532-247.967535S649.735422 63.99988 512.00768 63.99988zM32.26458 1023.99808a31.99994 31.99994 0 0 1-31.775941-37.56793c23.647956-133.50375 101.43981-254.943522 213.4716-333.119375a32.415939 32.415939 0 0 1 44.927916 7.807985 31.83994 31.83994 0 0 1-7.839986 44.575917c-98.175816 68.511872-166.367688 174.879672-187.103649 291.871453-2.719995 15.487971-16.319969 26.43195-31.67994 26.43195z"
                                            p-id="15392"></path>
                                        <path
                                            d="M991.718781 1023.99808c-15.327971 0-28.927946-10.943979-31.711941-26.46395-38.239928-216.479594-226.687575-373.5993-447.99916-373.5993a32.09594 32.09594 0 0 1-32.22394-31.99994c0-17.663967 14.431973-31.99994 32.22394-31.99994 252.671526 0 467.807123 179.359664 511.487041 426.5272A31.93594 31.93594 0 0 1 991.718781 1023.99808z"
                                            p-id="15393"></path>
                                    </svg>
                                </el-icon>
                            </div>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item v-for="item in genderlist" :key="item.name"
                                        @click="gender = item.value">
                                        {{ item.name }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
</el-dropdown>
</div>

<div class="icon-item">
    <el-dropdown>
        <div class="icon-btn">
            <el-icon :size="26">
                <svg t="1766548563953" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    p-id="25870">
                    <path
                        d="M516.864 85.333333l82.261333 19.114667c-10.069333 42.837333 9.984 82.730667 68.053334 124.330667 135.509333 97.024 167.509333 151.722667 128.981333 272.64-22.698667 71.253333 4.821333 97.28 99.84 97.28V682.666667c-145.92 0-223.018667-72.96-180.394667-206.592 24.874667-77.994667 11.434667-100.906667-97.834666-179.2-83.456-59.733333-119.722667-131.84-100.906667-211.541334z"
                        p-id="25871"></path>
                    <path
                        d="M134.656 440.32a384 384 0 0 0 495.445333 437.162667c-23.594667-54.528-49.322667-66.730667-97.28-65.365334-5.845333 0.128-10.837333 0.426667-21.76 1.066667-82.688 4.992-123.818667-5.333333-162.688-64.426667-43.477333-65.962667-29.866667-113.664 22.613334-174.165333l6.229333-7.168c39.082667-44.8 42.794667-58.794667 14.421333-99.584-31.744-45.653333-49.365333-48.085333-115.669333-29.098667-62.293333 17.792-102.229333 21.717333-141.312 1.578667z m26.368-84.394667c21.418667 16.341333 40.448 15.36 91.477333 0.768 97.408-27.861333 151.637333-20.309333 209.194667 62.421334 55.808 80.213333 41.642667 133.546667-20.181333 204.416l-6.058667 6.954666c-30.293333 34.986667-33.194667 45.013333-15.786667 71.381334 16.981333 25.856 31.317333 29.44 86.229334 26.154666 11.861333-0.725333 17.450667-1.024 24.490666-1.237333 81.664-2.304 137.813333 28.16 177.237334 115.712A384 384 0 1 0 161.066667 355.925333zM512 981.333333C252.8 981.333333 42.666667 771.2 42.666667 512S252.8 42.666667 512 42.666667s469.333333 210.133333 469.333333 469.333333-210.133333 469.333333-469.333333 469.333333z"
                        p-id="25872"></path>
                </svg>
            </el-icon>
        </div>
        <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item v-for="item in languagelist" :key="item.name"
                                        @click="language = item.value">
                                        {{ item.name }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
    </el-dropdown>
</div>
</div> -->
                <div class="segmented-control">
                    <div class="slider-thumb"
                        :style="{ transform: isPrivate ? 'translateX(100%)' : 'translateX(0)' }" />
                    <div class="segment-item" :class="{ active: !isPrivate }" @click="isPrivate = false"> 全部模型 </div>
                    <div class="segment-item" :class="{ active: isPrivate }" @click="isPrivate = true">我的模型 </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
const store = useTalkieStore();
const { tagList, gender, language, tags_type, isPrivate } = storeToRefs(store);
const searchQuery = ref('');
const tags = computed(() => [...tagList.value])
const genderlist = [
    { name: $at('全部'), value: 'all' },
    { name: $at('男'), value: 'M' },
    { name: $at('女'), value: 'F' },
]
const languagelist = [
    { name: $at('全部'), value: 'all' },
    { name: $at('中文'), value: 'zh-CN' },
    { name: $at('英文'), value: 'en-US' },
]
const isOpen = ref(false);
const selectRef = ref(null);

// 获取当前选中的对象
const selectedOption = computed(() => {
    return tags.value.find(option => option.value === tags_type.value) || tags.value[0];
});

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

onMounted(async () => {
    await store.getTag();
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