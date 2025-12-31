<template>
    <div class="card-container">
        <!-- 顶部图片区域 -->
        <div class="image-section">
            <img :src="item.avatar" alt="Emily" class="tutor-image" />
            <!-- 在线状态标签 -->
            <div class="online-badge">
                <span class="dot" />
                在线
            </div>
            <!-- 标签组 -->
            <div class="tags-row">
                <span class="tag">
                    <span class="icon">🚩{{ parseLang(item.language) }}</span>
                </span>
                <span class="tag">
                    <span class="icon pink">
                        <span :style="{ color: item.gender === 'M' ? '#5a9e91' : 'red' }">{{ item.gender === 'M' ?
                            '♂' : '♀' }}</span>
                        {{ item.gender === 'M' ? '男性' : '女性' }}
                    </span>
                </span>
                <span class="tag" v-if="item.action === 'RIG'">
                    <span class="icon">😷</span>
                </span>
            </div>
        </div>

        <!-- 信息内容区域 -->
        <div class="content-section">
            <h2 class="name">{{ item.name }}</h2>
            <p class="tagline">{{ item.description }}</p>



            <!-- 作者信息 -->
            <div class="author-row">
                <div class="author-info">
                    <span class="author-name">{{ $at('创建者') }}:<span class="at">@{{ item.user_name }}
                            <el-icon :size="12">
                                <V />
                            </el-icon>
                        </span></span>
                </div>
            </div>

            <!-- 底部按钮 -->
            <button class="call-button" @click="router.push(`/chat/${item.id}`)">
                <el-icon>
                    <svg t="1767087589367" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="6994">
                        <path
                            d="M706.709504 923.947008c-53.997568 0-124.09856-36.25984-173.268992-66.885632-66.076672-40.308736-136.998912-96.698368-200.660992-157.94176l-20.14208-20.160512c-61.247488-63.660032-117.661696-134.600704-157.960192-200.671232-30.623744-49.156096-66.881536-119.273472-66.881536-173.2608 0-58.025984 41.908224-120.076288 59.635712-144.257024 13.70112-18.532352 62.857216-78.974976 103.960576-78.974976 16.922624 0 35.454976 11.286528 59.63776 36.25984 20.946944 21.766144 41.089024 49.168384 54.790144 68.5056 17.727488 25.792512 34.664448 52.3776 46.739456 75.753472 20.158464 37.064704 21.766144 53.194752 21.766144 62.050304 0 17.727488-8.871936 33.845248-27.40224 45.93664-12.091392 8.871936-26.595328 14.505984-40.298496 20.959232-9.660416 4.026368-24.971264 10.469376-30.623744 15.314944 2.41664 8.050688 10.481664 29.011968 34.6624 63.660032 21.753856 32.231424 50.765824 67.684352 76.556288 94.285824 26.585088 25.792512 61.247488 53.999616 94.271488 76.576768 34.676736 23.351296 55.607296 32.23552 63.690752 34.650112 4.829184-5.64224 11.272192-20.965376 15.29856-30.625792 5.636096-13.71136 12.075008-28.207104 20.959232-40.312832 12.075008-18.520064 27.40224-28.207104 45.922304-28.207104 8.884224 0 24.182784 2.439168 62.050304 22.571008 23.379968 12.10368 49.975296 29.007872 75.769856 46.75584 19.324928 12.875776 46.723072 33.837056 68.487168 54.800384 24.987648 24.15616 36.25984 42.7008 36.25984 59.635712 0 41.091072-61.241344 90.261504-79.75936 103.950336C826.791936 882.051072 764.737536 923.947008 706.709504 923.947008L706.709504 923.947008 706.709504 923.947008z"
                            p-id="6995" fill="#ffffff"></path>
                        <path
                            d="M664.014848 484.74112c-8.884224 0-16.93696-5.648384-18.546688-14.505984-4.028416-25.792512-18.550784-47.546368-41.089024-62.050304-22.573056-15.310848-49.975296-20.156416-77.379584-15.310848-9.660416 1.609728-19.335168-4.845568-20.946944-15.312896-1.622016-9.6768 4.831232-19.351552 14.505984-20.959232 37.064704-6.443008 74.12736 0.804864 103.944192 20.959232 30.625792 20.14208 50.784256 50.765824 57.22112 86.2208 1.609728 9.6768-4.831232 19.351552-14.493696 20.959232C665.624576 484.74112 664.817664 484.74112 664.014848 484.74112L664.014848 484.74112z"
                            p-id="6996" fill="#ffffff"></path>
                        <path
                            d="M773.595136 438.001664c-8.8576 0-16.910336-6.455296-18.518016-15.312896-8.07936-49.168384-37.091328-91.062272-79.794176-120.07424-42.727424-28.209152-95.895552-38.688768-148.28544-29.81888-9.662464 2.414592-19.335168-4.84352-20.946944-14.505984-1.622016-9.6768 4.831232-19.351552 14.508032-20.96128 62.052352-11.272192 124.104704 1.609728 174.87872 35.467264 51.560448 33.841152 85.405696 84.609024 95.8976 143.439872 1.60768 10.479616-4.831232 19.349504-14.524416 21.766144C775.206912 438.001664 774.4 438.001664 773.595136 438.001664L773.595136 438.001664z"
                            p-id="6997" fill="#ffffff"></path>
                        <path
                            d="M919.461888 424.302592c-8.050688 0-16.130048-6.457344-17.737728-15.312896-14.4896-83.818496-62.857216-156.350464-136.18176-203.894784-73.345024-48.351232-162.801664-66.883584-251.424768-50.767872-10.496 1.613824-19.351552-4.829184-21.768192-15.310848-1.609728-9.6768 5.638144-19.337216 15.312896-20.96128 98.322432-16.922624 196.632576 2.428928 278.034432 56.416256 81.375232 53.999616 135.380992 134.58432 152.30976 228.868096 1.613824 9.674752-4.85376 19.349504-15.316992 20.96128C921.882624 424.302592 921.07776 424.302592 919.461888 424.302592L919.461888 424.302592z"
                            p-id="6998"></path>
                    </svg>
                </el-icon>
                {{ $at('立即通话') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import V from './V.vue';
import { $at } from 'i18n-auto-extractor';

const router = useRouter();
defineProps({
    item: {
        type: Object,
        default: () => ({})
    }
});
function parseLang(lang: string) {
    switch (lang) {
        case 'zh-CN':
            return $at('中文');
        case 'en-US':
            return $at('英文');
        case 'ja-JP':
            return $at('日文');
        default:
            return lang;
    };
};

</script>

<style scoped>
.card-container {
    --card-bg: #ffffff;
    --text-main: #1a1a1a;
    --text-sub: #4b5563;
    --text-muted: #9ca3af;
    --tag-bg: #f3f4f6;
    --tag-text: #4b5563;
    --verified-bg: #fdf2e9;
    --verified-text: #c29061;
    --btn-bg: #4a8277;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    /* 宽度限制逻辑 */
    width: 100%;
    min-width: 160px;
    max-width: 240px;
    background: var(--card-bg);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow);
    font-family: system-ui, -apple-system, sans-serif;
    padding: 8px;
    transition: all 0.3s ease;
    margin: 0 auto;
}

/* 2. 暗色模式变量：根据 html.dark 类名自动切换 */
.dark .card-container {
    --card-bg: #1e1e1e;
    --text-main: #ffffff;
    --text-sub: #d1d5db;
    --text-muted: #888888;
    --tag-bg: #2d2d2d;
    --tag-text: #9ca3af;
    --verified-bg: #2d241e;
    --verified-text: #e2ad7a;
    --shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* 3. 布局样式 */
.image-section {
    position: relative;
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--el-border-color);
}

.tutor-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.online-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(43, 121, 95, 0.85);
    backdrop-filter: blur(4px);
    color: #fff;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.dot {
    width: 6px;
    height: 6px;
    background: #4ade80;
    border-radius: 50%;
}

.content-section {
    padding: 10px 4px 4px 4px;
}

.name {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
}

/* 核心需求：单行省略 */
.tagline {
    font-size: 12px;
    color: var(--text-sub);
    margin: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

.tags-row {
    display: flex;
    flex-wrap: wrap;
    /* 宽度不足时自动换行 */
    gap: 4px;
    margin-bottom: 6px;
    position: absolute;
    bottom: 0;
    left: 5px;
}

.tag {
    background: var(--tag-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    color: var(--tag-text);
    white-space: nowrap;
    font-weight: 600;
    border: 1px solid var(--el-border-color);
}

.author-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.author-name {
    font-size: 10px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
}

.at {
    color: var(--text-sub);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
}

.verified-badge {
    background: var(--verified-bg);
    color: var(--verified-text);
    font-size: 9px;
    padding: 1px 5px;
    border-radius: 4px;
}

.call-button {
    width: 100%;
    background: var(--btn-bg);
    color: #fff;
    border: none;
    padding: 10px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: opacity 0.2s;
}

.call-button:active {
    opacity: 0.8;
}

.phone-icon {
    font-size: 12px;
}
</style>