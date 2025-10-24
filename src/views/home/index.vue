<template>
    <div class="home">
        <MainPage>

            <Swiper />
            <h2>{{ $at('为你推荐') }}
                <img
                    src="https://cdn.talkie-ai.com/public-cdn-s3-us-west-2/talkie-op-img/image/1660802544_1722257297570_recommend-star.svg">
            </h2>
            <div class="tabs">
                <div class="tabitem" :class="{ 'active': activeTab === index }" v-for="(item, index) in tagList"
                    :key="index" @click="handleTabClick(index)">
                    {{ item.name }}
                </div>
            </div>
            <div class="content">
                <div class="cards">
                    <div :xs="12" :sm="6" :md="4" class="card_item" v-for="item in talkieList" :key="item">
                        <div class="cover">
                            <el-image loading="lazy" :src="item.avatar" fit="cover" />
                            <div class="info">
                                <p>{{ item.name }}</p>
                                <p class="desc">{{ item.description }}</p>
                            </div>
                        </div>
                        <p class="creator">{{ $at('由') }} @币安熊 {{ $at('创建') }}</p>
                        <div class="btn" @click="router.push(`/chat/${item.id}`)">
                            <el-icon>
                                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                    p-id="8171">
                                    <path
                                        d="M708.608 101.888a459.9808 459.9808 0 0 0-193.536-43.008 455.68 455.68 0 0 0-407.04 660.48c8.704 17.408 5.12 48.64 2.048 79.36-5.12 45.568-10.24 93.184 20.992 120.32 11.264 9.728 28.16 14.336 53.76 14.336a540.672 540.672 0 0 0 61.952-5.12 456.0384 456.0384 0 0 1 54.272-4.608 67.7376 67.7376 0 0 1 20.992 2.56 457.9328 457.9328 0 0 0 193.536 43.52 464.7936 464.7936 0 0 0 155.136-27.136 452.5568 452.5568 0 0 0 257.536-235.008c105.984-226.816 7.68-498.688-219.648-605.696zM236.032 655.36a312.32 312.32 0 0 1 279.04-453.12 312.32 312.32 0 0 1 0 624.64h-0.512a311.0912 311.0912 0 0 1-132.096-29.696 183.4496 183.4496 0 0 0-81.408-16.384 426.7008 426.7008 0 0 0-45.056 2.56c2.56-36.864 2.048-83.968-19.968-128z"
                                        p-id="8172"></path>
                                    <path
                                        d="M432.64 693.248h153.6a72.2432 72.2432 0 0 0 71.68-71.68 72.2432 72.2432 0 0 0-71.68-71.68h-153.6a71.68 71.68 0 0 0 0 143.36z"
                                        p-id="8173"></path>
                                </svg>
                            </el-icon>
                            {{ $at('立即通话') }}
                        </div>
                    </div>
                </div>
            </div>

        </MainPage>
    </div>
    <div class="footer">
        <div class="logo">
            <img :src="isDark ? '/image/logo_dark.png' : '/image/logo_light.png'" />
            <span>Aianace</span>
        </div>
        <div class="footIcon">
            <a v-for="item in iconList" :href="item.url" target="_blank" rel="noopener noreferrer">
                <svg t="1721024055673" class="iconItem" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="4831" width="200" height="200">
                    <path :d="item.icon" p-id="4832" fill="#96979b"></path>
                </svg>
            </a>
        </div>
        <div class="copyright">
            Copyright © 2025 Aianace. All rights reserved.
        </div>
    </div>

</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import MainPage from '@/components/mainPage.vue'
import { useDark } from '@vueuse/core';
const isDark = useDark();
const iconList = [
    { icon: svg.twitter, url: '#' },
    { icon: svg.github, url: "#" },
    { icon: svg.telegram, url: "#" },
    { icon: svg.youtube, url: "#" },
    { icon: svg.docs, url: "#" },
]
const router = useRouter();
const store = useTalkieStore();
const { tagList, talkieList } = storeToRefs(store);

const activeTab = ref(0);
const handleTabClick = (index: number) => {
    activeTab.value = index;
    getAiList();
};
const getAiList = async () => {
    await store.getTalkie({
        tags_type: tagList.value[activeTab.value].name
    });
};

onMounted(async () => {
    await store.getTag();
    getAiList();
});

</script>
<style scoped lang="scss">
.home {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 10px;
    overflow-y: auto;

    h1 {

        img {
            width: 20px;
            height: 30px;
        }
    }

    .tabs {
        width: 100%;
        display: flex;
        align-items: center;
        min-height: 40px;
        overflow-y: auto;
        padding: 10px;
        box-sizing: border-box;

        .tabitem {
            flex-shrink: 0;
            padding: 10px;
            background: var(--tab-item-bg);
            margin-right: 10px;
            border-radius: 8px;
            cursor: pointer;

            @media (max-width: 768px) {
                font-size: 12px;
            }
        }

        .active {
            background: #fff;
            color: #161823;
        }

    }

    .content {
        width: 100%;

        @media (max-width: 768px) {
            height: calc(100% - 54px);
        }

        .cards {
            width: 100%;
            margin-top: 10px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;

            @media (max-width: 768px) {
                gap: 10px;
                justify-content: space-around;

            }

            .card_item {
                aspect-ratio: 1 / 1.34;
                max-width: 212px;
                position: relative;
                padding: 10px;
                background: var(--home-crad-item-background); //rgb(228 228 231);
                border-radius: 10px;
                box-sizing: border-box;

                @media (max-width: 768px) {
                    max-width: 170px;
                }

                .cover {
                    aspect-ratio: 1 / 1;
                    width: 100%;
                    border-radius: 10px;
                    position: relative;

                    .el-image {
                        width: 100%;
                        height: 100%;
                        border-radius: 10px;
                    }

                    .info {
                        width: 100%;
                        display: flex;
                        padding: 10px;
                        flex-direction: column;
                        justify-content: space-between;
                        align-items: flex-start;
                        box-sizing: border-box;
                        gap: 4px;
                        flex-shrink: 0;
                        border-radius: 10px;
                        color: #fff;
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        font-weight: bold;

                        .desc {
                            width: 100%;
                            font-size: 12px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }
                }

                .creator {
                    font-size: 12px;
                    color: #a2a2ac;
                }

                .btn {
                    background-color: var(--home-card-item-background);
                    width: 100%;
                    padding: 5px 0;
                    border-radius: 10px;
                    margin: 0 auto;
                    font-size: 14px;
                    text-align: center;
                    cursor: pointer;
                    margin-top: 10%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                }
            }

        }
    }
}

.footer {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 14px;
    margin-top: 20px;

    .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;

        img {
            width: 40px;
            height: 40px;
        }

        span {
            font-size: 16px;
            font-weight: bolder;
        }
    }

    .footIcon {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;

        a {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
    }

    .copyright {
        margin-top: 20px;
        color: #96979b;
    }
}
</style>
