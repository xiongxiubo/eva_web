<template>
    <div style="position: relative;">
        <!-- <SoundWave /> -->

        <div class="swiper-header">
            <h1>{{ $at('热门推荐') }}
                <img
                    src="https://cdn.talkie-ai.com/public-cdn-s3-us-west-2/talkie-op-img/image/1660802544_1722257297570_recommend-star.svg">
            </h1>
            <div class="swiper-header-icon" @click="isMuted = !isMuted">
                <el-icon>
                    <img src="/image/audio-unmuted.svg" alt="" v-if="isMuted">
                    <img src="/image/audio-mute.svg" alt="" v-else>
                </el-icon>
            </div>
        </div>
        <div class="swiper-container">
            <Swiper :loop="HotList.length > 5" :modules="modules" :slides-per-view="swiperCount"
                :space-between="swiperbetween" navigation :centeredSlides="true" :pagination="{ clickable: true }"
                :scrollbar="{ draggable: true }" @swiper="onSwiper" @slide-change="onSlideChange">
                <SwiperSlide v-for="item in HotList" :key="item.ID" v-slot="{ isActive }">
                    <div :class="{ 'swiper-slide-active': isActive }">
                        <img :class="{ 'swiper-img': isActive }" :src="item.avatar" alt="">
                        <div class="name" v-if="isActive" @click="router.push(`/chat/${item.id}`)">{{ item.name }}
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
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>
            <div class="sound-wave" />
        </div>
    </div>

</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import { Swiper, SwiperSlide, } from 'swiper/vue';
import { Navigation, Virtual } from 'swiper/modules';
import { eq, get } from 'lodash';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/virtual';

const router = useRouter();
const { isMobile } = useDevice()
const modules = [Navigation, Virtual];

const swiperCount = computed(() => isMobile.value ? 3 : 5)
const swiperbetween = computed(() => isMobile.value ? 30 : -50)

const currentIndex = ref(0);
const swiperRef = ref<any>(null);

const isMuted = ref(true);

const onSwiper = (swiper: any) => {
    currentIndex.value = swiper.realIndex;
    swiperRef.value = swiper;
};
const onSlideChange = (e: any) => {
    if (currentIndex.value === e.realIndex) return;
    // e.navigation.nextEl.click();
};
const HotList = ref<any[]>([]);
const HotAi = async () => {
    const res = await getHotAi()
    if (eq(res.code, 0)) {
        HotList.value = get(res.data, 'list', []);
    }
}
onMounted(async () => {
    await HotAi();
});

</script>
<style lang="scss" scoped>
.swiper-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;

    .swiper-header-icon {
        width: 42px;
        height: 42px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-radius: 15px;
        background: var(--swiper-header-icon-background);

    }
}

.swiper {
    height: 100%;
}

.swiper-slide {
    display: flex;
    justify-content: center;
    align-items: center;
}

.swiper-container {
    width: 100%;
    max-width: 900px;
    height: 240px;
    flex-shrink: 0;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;


    .sound-wave {
        width: 140px;
        height: 140px;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, );

        &::before {
            content: '';
            position: absolute;
            top: 45px;
            left: -5px;
            width: 150px;
            height: 150px;
            border: 2px solid var(--sound-wave-border-color);
            border-radius: 40px;

            opacity: 1;
            box-sizing: border-box;
            animation: ripple 1s linear 1s infinite;
        }

        &::after {
            content: '';
            position: absolute;
            top: 50px;
            left: 0;
            width: 140px;
            height: 140px;
            border: 2px solid var(--sound-wave-border-color);
            border-radius: 40px;
            box-sizing: border-box;
            opacity: 1;
            animation: ripple 1s linear 1s infinite;
        }
    }

    img {
        width: 140px;
        height: 140px;
        object-fit: cover;
        border-radius: 40px;
        transform: scale(.8);
    }
}



.swiper-slide-active {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    .swiper-img {
        transform: scale(1);
        position: relative;
    }

    .name {
        max-width: 120px;
        position: absolute;
        bottom: -40px;
        background: #fff;
        color: #000;
        padding: 5px 20px;
        border-radius: 20px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: space-around;

        .el-icon {
            margin-left: 5px;
        }
    }
}

@keyframes ripple {
    0% {
        transform: scale(1);
        opacity: 0;
    }


    50% {
        transform: scale(1.05);
        opacity: 0.5;
    }

    100% {
        transform: scale(1.1);
        opacity: 0;
    }
}

:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
    color: #fff;

    &::after {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
        font-size: 14px;
        background: rgb(37, 40, 49);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
