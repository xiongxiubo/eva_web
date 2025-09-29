<template>
    <div class="home">
        <MainPage>

            <Head v-if="!isMobile" />
            <h1 v-if="!isMobile">For You
                <img
                    src="https://cdn.talkie-ai.com/public-cdn-s3-us-west-2/talkie-op-img/image/1660802544_1722257297570_recommend-star.svg">
            </h1>
            <div class="tabs">
                <div class="tabitem" :class="{ 'active': activeTab === index }" v-for="(item, index) in tagList"
                    :key="index" @click="handleTabClick(index)">
                    {{ item.name }}
                </div>
            </div>
            <div class="content">
                <el-row class="cards">
                    <el-col :xs="12" :sm="6" :md="4" class="card_item" v-for="item in talkieList" :key="item">
                        <div class="cover">
                            <el-image loading="lazy" :src="item.avatar" fit="cover" />
                        </div>
                        <div class="info">
                            <p>{{ item.name }}</p>
                            <p class="desc">{{ item.description }}</p>
                        </div>
                        <div class="info_top">
                            <p>{{ item.description }}</p>
                            <div class="btn" @click="router.push(`/chat/${item.id}`)">Chat Now</div>
                        </div>
                    </el-col>
                </el-row>
            </div>

        </MainPage>
    </div>
    <div class="footer">
        <div class="logo">
            <img :src="isDark ? '/image/logo_dark.png' : '/image/logo_light.png'" />
            <span>Eva</span>
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
            Copyright © 2025 Eva. All rights reserved.
        </div>
    </div>

</template>
<script setup lang="ts">
import Head from '@/views/home/head.vue';
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
const { isMobile } = useDevice();
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

    h1 {
        margin-top: 20px;

        img {
            width: 20px;
            height: 30px;
        }
    }

    .tabs {
        width: 100%;
        display: flex;
        align-items: center;
        overflow: auto;
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
        overflow-y: auto;
        height: calc(100% - 55px - 262px);

        @media (max-width: 768px) {
            height: calc(100% - 54px);
        }

        .cards {
            width: 100%;
            margin-top: 10px;

            .card_item {
                aspect-ratio: 1 / 1.34;
                // width: 212px;
                // height: 350px;
                position: relative;
                padding: 10px;

                .cover {
                    width: calc(100% - 20px);
                    height: calc(100% - 20px);
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    z-index: 1;
                    border-radius: 10px;

                    .el-image {
                        width: 100%;
                        height: 100%;
                        border-radius: 10px;
                    }
                }

                .info {
                    transition: all .3s ease;
                    position: absolute;
                    z-index: 10;
                    bottom: 10px;
                    left: 10px;
                    width: calc(100% - 20px);
                    height: 33%;
                    display: flex;
                    padding: 10px;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: flex-start;
                    box-sizing: border-box;
                    gap: 4px;
                    flex-shrink: 0;
                    background: linear-gradient(0deg, rgba(18, 18, 20, .8) -9.48%, rgba(18, 18, 20, .8) 70.08%, rgba(18, 18, 20, 0) 99.2%);
                    border-radius: 10px;
                    color: #fff;

                    .desc {
                        width: 100%;
                        font-size: 12px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }

                .info_top {
                    transition: all .3s ease;
                    opacity: 0;
                    position: absolute;
                    z-index: 10;
                    top: 10px;
                    left: 10px;
                    width: calc(100% - 20px);
                    height: calc(100% - 20px);
                    background-color: rgba($color: #000000, $alpha: 0.9);
                    border-radius: 10px;
                    border: 1px solid #fff;
                    padding: 20px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;

                    p {
                        color: #fff;
                        font-size: 14px;
                        overflow-y: auto;
                        height: 60%;
                    }

                    .btn {
                        background-color: #fff;
                        width: 80%;
                        padding: 5px 0;
                        border-radius: 10px;
                        margin: 0 auto;
                        margin-top: 10px;
                        color: #000000;
                        font-size: 14px;
                        text-align: center;
                        cursor: pointer;
                        margin-top: auto;
                    }
                }

                &:hover .info {
                    height: 0;
                    opacity: 0;
                    transition: all .3s ease;
                    pointer-events: none;
                }

                &:hover .info_top {
                    opacity: 1;
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
