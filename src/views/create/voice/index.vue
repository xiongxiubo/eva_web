<template>
    <div class="create-voice">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>{{ $at('我的音色') }}</span>
                    <el-button type="primary" @click="visible = true">{{ $at('创建音色') }}</el-button>
                </div>
            </template>
            <el-tabs v-model="status" type="border-card">
                <el-tab-pane v-for="tab in tabs" :label="tab.label" :name="tab.name">
                    <ul class="voice-list">
                        <li v-for="voice in userVoiceList" :key="voice.id" class="voice-item">
                            <div class="voice-info">
                                <Audio :src="getVoiceUrl(voice)" />
                                <div class="voice-details">
                                    <div class="voice-name">{{ voice.name }}</div>
                                    <div class="voice-tags">
                                        <span class="tag gender">{{ getGenderLabel(voice.gender) }}</span>
                                        <span class="tag accent">{{ voice.language || $at('未知') }}</span>
                                    </div>
                                </div>
                            </div>
                            <!-- 状态 -->
                            <component :is="getStatusTag(voice.status)" />
                        </li>
                    </ul>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>

    <el-dialog v-model="visible" :show-close="false" :width="width">
        <div class="modal-content">
            <div class="voice-name-input">
                <label for="voice-name">{{ $at('说出你的声音') }}</label>
                <el-input v-model="voiceName" maxlength="20" :placeholder="$at('请输入20个字符以内')" show-word-limit
                    type="text" />
            </div>
            <h3 class="section-title">{{ $at('上传样本') }}</h3>
            <div class="upload-options">
                <DragUpload class="option-card" @change="handleFileChange" />
                <Record class="option-card " @record-end="recordEnd" />
            </div>
            <div class="info-section">
                <div class="info-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8" />
                    </svg>
                    <p>
                        {{ $at('尚未上传任何内容。请上传您想克隆的声音的音频样本。') }}
                        <br />
                        **{{ $at('样本质量比数量更重要。') }}** {{ $at('噪声较大的样本可能会导致糟糕的结果。提供超过10秒的音频对提升效果帮助不大。') }}
                    </p>
                </div>

                <label class="confirmation-checkbox">
                    <input type="checkbox" v-model="isConfirmed" />
                    <span class="checkmark"></span>
                    <span class="confirmation-text">
                        {{ $at('我在此确认，我拥有上传和克隆这些语音样本的所有必要权利和许可，并且我不会将平台生成的内容用于任何非法、欺诈或有害的目的。') }}
                    </span>
                </label>
            </div>
        </div>

        <footer class="modal-footer">
            <button class="btn btn-back" @click="visible = false">{{ $at('取消') }}</button>
            <button class="btn btn-clone" v-loading="loading" :disabled="voiceName.length === 0" @click="clonevoice">
                {{ $at('克隆语音') }}
            </button>
        </footer>
    </el-dialog>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import Audio from '@/views/create/voice/Audio.vue';
import Record from '@/views/create/voice/Record.vue';
const store = useVoiceStore();
const { userVoiceList, status } = storeToRefs(store);
const { clone, getUserVoice } = store;
const isConfirmed = ref(false);
const visible = ref(false);
const voiceName = ref('');
const file = ref<File>();
const { isMobile } = useDevice();
const width = computed(() => isMobile.value ? '100%' : '50%');
const loading = ref(false);
const blob = ref<Blob>();
const recordEnd = (b: Blob) => blob.value = b;

const tabs = [
    { label: $at('审核通过'), name: 'active', },
    { label: $at('审核中'), name: 'pending', },
    { label: $at('审核拒绝'), name: 'rejected', },
]
const getVoiceUrl = (voice: any) => {
    if (voice.sample_audio_url) return voice.sample_audio_url;
    return voice.voice_url;
}
// 处理文件上传
const handleFileChange = (e: File) => file.value = e;
const clonevoice = async () => {
    if (!file.value && !blob.value) return ElMessage.error($at('请上传或记录样本'));
    const formData = new FormData();
    formData.append('file', blob.value ?? file.value!);
    formData.append('name', voiceName.value);
    try {
        loading.value = true;
        const res = await clone(formData);
        if (res) visible.value = false;
    } catch (error) {
        console.error($at("克隆音色失败:"), error);
    } finally {
        loading.value = false;
    }
};

function getGenderLabel(gender: string) {
    switch (gender) {
        case 'M':
            return $at('男');
        case 'F':
            return $at('女');
        default:
            return $at('未知');
    }
}

const getStatusTag = (status: string) => {
    const map: Record<string, { type: 'warning' | 'danger' | 'success'; label: string }> = {
        pending: { type: 'warning', label: $at('待审核') },
        rejected: { type: 'danger', label: $at('审核拒绝') },
        active: { type: 'success', label: $at('审核通过') },
    };
    const item = map[status];
    if (!item) return status;
    return h(
        ElTag,
        { type: item.type },
        () => item.label
    );
};
onMounted(() => {
    getUserVoice();
});
</script>
<style scoped lang="scss">
@use "sass:color";
$info-yellow: #f8c940;
$primary-color: #4b89ff;

@mixin dark-scrollbars {
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 3px;

        &:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }
    }

    &::-webkit-scrollbar-track {
        background-color: transparent;
    }
}

:deep(.el-card) {
    border-radius: 10px;
}

.create-voice {
    padding: 0 20px;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
            font-size: 18px;
            font-weight: 600;
        }
    }

    .voice-list {
        width: 100%;
        height: calc(100vh - 240px);
        list-style: none;
        overflow-y: auto; // Crucial for scrolling the list within the modal
        @include dark-scrollbars;

        .voice-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            transition: background-color 0.2s;
            background-color: var(--el-menu-bg-color);
            border-radius: 10px;
            margin-bottom: 10px;
            border: 1px solid var(--el-border-color);
        }

        .voice-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .play-button {
            background-color: var(--msg-input-bg-color);
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            flex-shrink: 0; // Prevent button from shrinking
        }

        .voice-name {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .voice-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;

            .tag {
                font-size: 11px;
                padding: 3px 8px;
                border-radius: 12px;
                background-color: #383838;
                white-space: nowrap;

                // Optional: Specific color for certain tags
                &.gender {
                    background-color: #444;
                    color: #ccc;
                }

                &.accent {
                    background-color: #1a3a3a;
                    color: #46b8b8;
                }
            }
        }

        .use-button {
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 500;
            flex-shrink: 0;

            &:hover {
                background-color: rgba($color: transparent, $alpha: 0.8);
                color: white;
            }
        }
    }
}

.modal-content {
    padding: 20px;
    flex-grow: 1;
    overflow-y: auto; // Allow content to scroll

    .section-title {
        font-size: 16px;
        font-weight: 600;
        margin-top: 20px;
        margin-bottom: 15px;
    }

    .voice-name-input {
        margin-bottom: 25px;

        label {
            display: block;
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 8px;
        }
    }

    .upload-options {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;

        .option-card {
            flex: 1;
            min-height: 150px;
            border-radius: 8px;
            border: 2px dashed var(--el-border-color);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            cursor: pointer;
            transition: border-color 0.2s, background-color 0.2s;

            h4 {
                font-size: 16px;
                margin: 0 0 5px 0;
            }

            p {
                font-size: 12px;
                line-height: 1.4;
            }

            &:hover {
                background-color: rgba($color: transparent, $alpha: .1);
            }
        }


    }

    .info-section {
        margin-bottom: 20px;

        .info-box {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            background-color: rgba($info-yellow, 0.1);
            border: 1px solid $info-yellow;
            padding: 15px;
            border-radius: 6px;
            font-size: 14px;
            margin-bottom: 20px;

            svg {
                color: $info-yellow;
                flex-shrink: 0;
                margin-top: 2px;
            }

            p strong {
                font-weight: 700;
                color: white;
            }
        }
    }

    .file-info {
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 20px;
    }

    .confirmation-checkbox {
        display: flex;
        align-items: flex-start;
        cursor: pointer;
        user-select: none;
        font-size: 13px;
        line-height: 1.5;

        input[type='checkbox'] {
            display: none;
        }

        .checkmark {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 2px solid var(--el-border-color);
            border-radius: 4px;
            margin-right: 10px;
            flex-shrink: 0;
            position: relative;
            transition: background-color 0.2s, border-color 0.2s;
        }

        input[type='checkbox']:checked+.checkmark {
            background-color: $primary-color;
            border-color: $primary-color;

            &::after {
                content: '';
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                width: 5px;
                height: 10px;
                border: solid white;
                border-width: 0 2px 2px 0;
            }
        }
    }
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid var(--el-border-color);
    gap: 15px;

    .btn {
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s, background-color 0.2s;

        &-back {
            border: none;

            &:hover {
                background-color: rgba($color: transparent, $alpha: .1);
            }
        }

        &-clone {
            background-color: $primary-color;
            color: white;
            border: none;

            &:hover:not(:disabled) {
                background-color: color.scale($primary-color, $lightness: -10%);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }
}

@media (max-width: 768px) {
    .modal-content {
        padding: 15px;
    }

    .modal-footer {
        padding: 12px 15px;
        justify-content: space-between;

        .btn {
            flex: 1;
        }
    }

    .upload-options {
        flex-direction: column;
        gap: 15px;
    }

    .option-card {
        min-height: 100px;
    }

    .info-box {
        font-size: 13px;
    }

    .confirmation-checkbox {
        .confirmation-text {
            font-size: 12px;
        }
    }
}
</style>
