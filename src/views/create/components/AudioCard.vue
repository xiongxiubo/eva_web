<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import { formatTime } from '@/utils/time';
import { eq } from 'lodash';

interface CardProps {
    id: number;
    name: string;
    gender: string;
    language: string;
    created_at: string;
    status: string;
    sample_audio_url?: string;
    voice_url: string;
};

const props = defineProps({
    item: {
        type: Object as () => CardProps,
        default: () => ({})
    },
});

const isPlaying = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);

// 切换播放/暂停
const togglePlay = () => {
    if (!audioRef.value) return;

    if (isPlaying.value) {
        audioRef.value.pause();
    } else {
        audioRef.value.play();
    }
    isPlaying.value = !isPlaying.value;
};
const getVoiceUrl = computed(() => {
    if (props.item.sample_audio_url) return props.item.sample_audio_url;
    return props.item.voice_url;
});
const computedStatus = computed(() => {
    switch (props.item.status) {
        case 'pending':
            return h(ElTag, { type: 'warning' }, () => '待审核');
        case 'rejected':
            return h(ElTag, { type: 'danger' }, () => '已拒绝');
        default:
            return h(ElTag, { type: 'success' }, () => '已通过');
    };
});
function formatGender(gender: string) {
    switch (gender) {
        case 'M':
            return '男';
        case 'F':
            return '女';
        default:
            return '未知';
    };
};

function handleDelete() {
    ElMessageBox.confirm($at('确定删除吗？'), $at('删除'), {
        confirmButtonText: $at('确定'),
        cancelButtonText: $at('取消'),
        type: 'warning',
    }).then(async () => {
        try {
            const res = await delvoice(props.item.id);
            if (eq(res.code, 0)) {
                ElMessage.success($at('删除成功'));
                useVoiceStore().getUserVoice();
            } else {
                ElMessage.error($at(res.msg || '删除失败'));
            }
        } catch (error) {
            ElMessage.error($at('删除失败'));
        }
    })
}

// 音频播放结束重置状态
const onEnded = () => { isPlaying.value = false };
</script>

<template>
    <div class="card-container">
        <div class="downmenu" v-if="!(item.status === 'active')">
            <el-dropdown>
                <el-icon :size="24">
                    <MoreFilled />
                </el-icon>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="handleDelete">{{ $at('删除') }}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        <div class="audio-cover-area" @click="togglePlay">
            <div class="audio-visualizer-bg">
                <div class="bars" :class="{ 'is-playing': isPlaying }">
                    <div v-for="i in 5" :key="i" class="bar"></div>
                </div>
                <div class="play-button">
                    <div v-if="!isPlaying" class="icon-play"></div>
                    <div v-else class="icon-pause"></div>
                </div>
            </div>

            <div class="sample-tag">音频</div>
            <audio ref="audioRef" :src="getVoiceUrl" @ended="onEnded" style="display: none;"></audio>
        </div>

        <div class="content-area">
            <div class="header-row">
                <h2 class="title">{{ item.name }}</h2>
                <div class="status-badge">
                    <component :is="computedStatus" />
                </div>
            </div>
            <p class="description">语言：{{ item.language || '未知' }}</p>
            <div class="divider"></div>
            <div class="footer">创建时间：{{ formatTime(item.created_at) }}</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$bg-card: #0d0d0d;
$bg-audio: #1c1c1e;

.card-container {
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--el-border-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

    display: flex;
    flex-direction: column;
    transition: transform 0.2s;
    position: relative;

    &:hover {
        transform: scale(1.02); // 悬停反馈

        .downmenu {
            display: block;
        }
    }

    &:active {
        transform: scale(0.98); // 点击反馈
    }

    .downmenu {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
        display: none;
    }

    .audio-cover-area {
        position: relative;
        margin: 12px;
        width: calc(100% - 24px);
        aspect-ratio: 1 / 1;
        // background-color: $bg-audio;
        border-radius: 12px;
        cursor: pointer;
        overflow: hidden;

        .audio-visualizer-bg {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-image: radial-gradient(var(--audio-card-backage-color) 1.5px, transparent 1.5px);
            background-size: 12px 12px;
            gap: 20px;

            // 音频跳动条动画
            .bars {
                display: flex;
                align-items: flex-end;
                gap: 4px;
                height: 40px;

                .bar {
                    width: 4px;
                    height: 8px;
                    background-color: #3a3a3c;
                    border-radius: 2px;
                    transition: height 0.2s;
                }

                &.is-playing {
                    .bar {
                        background-color: #007aff; // 播放时变蓝色
                        animation: bounce 0.6s infinite alternate;

                        @for $i from 1 through 5 {
                            &:nth-child(#{$i}) {
                                animation-delay: #{$i * 0.1}s;
                            }
                        }
                    }
                }
            }

            .play-button {
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
                cursor: pointer;
                border: 1px solid var(--el-border-color);

                .icon-play {
                    width: 0;
                    height: 0;
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                    border-left: 16px solid white;
                    margin-left: 4px;
                }

                .icon-pause {
                    width: 14px;
                    height: 16px;
                    border-left: 4px solid white;
                    border-right: 4px solid white;
                }
            }
        }

        .sample-tag {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: #000;
            color: #eee;
            font-size: 10px;
            padding: 3px 6px;
            border-radius: 4px;
        }
    }

    .content-area {
        padding: 0 12px 12px 12px;

        .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .title {
                font-size: 16px;
                margin: 0;
            }

            .status-badge {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
            }
        }

        .description {
            font-size: 12px;
            color: #b0b0b5;
            margin: 8px 0;
        }

        .divider {
            height: 1px;
            background: var(--el-border-color);
            margin-bottom: 8px;
        }

        .footer {
            font-size: 10px;
            color: #636366;
        }
    }
}

@keyframes bounce {
    from {
        height: 8px;
    }

    to {
        height: 32px;
    }
}
</style>