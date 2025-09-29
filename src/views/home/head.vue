<template>
    <div class="head">
        <div class="head_l">
            <h5>{{ $at('关于介绍：') }}</h5>
            <p>{{ get(HotList[index], 'description', '') }}</p>
        </div>
        <div class="head_r">
            <swiper :modules="modules" :loop="HotList.length > 5" :pagination="{ clickable: true }"
                :centeredSlides="true" :slidesPerView="5" class="custom-swiper" :navigation="true"
                :autoplay="{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }"
                @slideChange="onSlideChange">
                <SwiperSlide v-for="(item, i) in HotList" :key="i" class="swiper-slide-item">
                    <img loading="lazy" :src="item.avatar" class="slide-img" />
                    <div class="info" v-if="index === i">
                        <p>{{ item.name }}</p>
                        <p class="desc">{{ item.description }}</p>
                    </div>
                </SwiperSlide>
            </swiper>
            <img class="star" style="left: 0px; top: 168px;" src="/image/single-star.svg">
            <img class="star" style="left: 252px; top: 0px; width: 15px; height: 15px;" src="/image/single-star.svg">
            <img class="star" style="right: 8px; bottom: 0px;" src="/image/single-star.svg">
        </div>
    </div>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Autoplay } from 'swiper/modules';
import { eq } from 'lodash';
const HotList = ref<any[]>([]);

import 'swiper/css';
import "swiper/css/navigation";
import "swiper/css/pagination";
import { get } from 'lodash';
const index = ref(0)
const modules = [Navigation, Autoplay]
const onSlideChange = (e: any) => {
    index.value = e.realIndex
}
const HotAi = async () => {
    const res = await getHotAi()
    if (eq(res.code, 0)) {
        HotList.value = res.data.list;
    }
}
onMounted(async () => {
    await HotAi();
});
</script>
<style scoped lang="scss">
.head {
    width: 100%;
    display: flex;
    align-items: center;
    height: 242px;
    margin-top: 60px;

    .head_l {
        width: 50%;
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        overflow: hidden;
        padding: 0 10px;

        h5 {
            font-size: 19px;
            font-weight: 500;
            margin-bottom: 12px;
        }

        p {
            font-size: 36px;
            font-weight: 700;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            overflow: hidden;
        }
    }

    .head_r {
        height: 100%;
        width: 50%;
        position: relative;

        .star {
            position: absolute;
        }
    }
}

.custom-swiper {
    width: 100%;
    height: 100%;

}

/* 所有 slide 默认缩小 */
.swiper-slide-item {
    display: flex;
    justify-content: center;
    transition: transform 0.3s ease;
    position: relative;

    .info {
        transition: all .3s ease;
        position: absolute;
        z-index: 10;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 33%;
        display: flex;
        padding: 10px;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        box-sizing: border-box;
        gap: 4px;
        flex-shrink: 0;
        background: linear-gradient(0deg, rgba(18, 18, 20, .9) -9.48%, rgba(18, 18, 20, .9) 70.08%, rgba(18, 18, 20, 0) 99.2%);
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
}

.slide-img {
    border-radius: 12px;
    transition: transform 0.3s ease;
    width: 100%;
    height: auto;
    transform: scale(0.8);
    object-fit: cover;
}

/* 中间的主图放大 */
.swiper-slide-active .slide-img {
    transform: scale(1);
    z-index: 10;
}

.slide-title {
    position: absolute;
    bottom: 0;
    z-index: 11;
}

:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
    &::after {
        font-size: 20px;
        color: var(--swiper-color);
    }
}

:deep(.swiper-button-prev) {
    left: -8px;
}

:deep(.swiper-button-next) {
    right: -8px;
}
</style>
