<template>
    <div class="home">
        <MainPage>
            <h2>{{ $at('为你推荐') }}
                <img
                    src="https://cdn.talkie-ai.com/public-cdn-s3-us-west-2/talkie-op-img/image/1660802544_1722257297570_recommend-star.svg">
            </h2>
            <FilterBar />
            <div class="content">
                <el-skeleton animated :loading="loading" :count="4" class="cards">
                    <template #template>
                        <div class="card_item">
                            <div class="cover">
                                <el-skeleton-item variant="image" class="el-image" />
                                <div class="info">
                                    <el-skeleton-item variant="p" />
                                    <el-skeleton-item variant="p" />
                                </div>
                            </div>
                            <el-skeleton-item variant="p" style="width: 50%" />
                            <el-skeleton-item variant="p" />
                            <el-skeleton-item variant="p" />
                        </div>
                    </template>
                    <template #default>
                        <Empty v-if="talkieList.length === 0" />
                        <div class="cards" v-else>
                            <Card v-for="item in talkieList" :key="item.id || item.key || item" :item="item" />
                        </div>
                    </template>
                </el-skeleton>
            </div>
        </MainPage>
    </div>
</template>
<script setup lang="ts">
import Card from './Card.vue'
import { $at } from 'i18n-auto-extractor';
import MainPage from '@/components/mainPage.vue'
import FilterBar from './FilterBar.vue';
const store = useTalkieStore();
const { talkieList, loading } = storeToRefs(store);
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
            font-weight: bolder;
            cursor: pointer;

            @media (max-width: 768px) {
                font-size: 12px;
            }
        }

        .active {
            background: #fff;
            color: #161823;
        }

        .private {
            margin-left: auto;
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
            display: grid;
            gap: 20px;
            flex-wrap: wrap;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

            @media (max-width: 768px) {
                gap: 10px;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            }

            .card_item {
                aspect-ratio: 1 / 1.34;
                position: relative;
                padding: 10px;
                background: var(--home-crad-item-background); //rgb(228 228 231);
                border-radius: 10px;
                box-sizing: border-box;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

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
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: #a2a2ac;

                    .el-link {
                        font-size: 12px;
                    }
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
    margin-top: auto;

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
