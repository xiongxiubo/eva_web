<template>
    <el-dialog v-model="dialogVisible" :show-close="false" :width="width">
        <template #header="{ close }">
            <header class="modal-header">
                <h2 class="modal-title">{{ $at('选择语音') }}</h2>
                <button class="close-button" @click="close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="m12 10.586l4.95-4.95l1.414 1.414l-4.95 4.95l4.95 4.95l-1.414 1.414l-4.95-4.95l-4.95 4.95l-1.414-1.414l4.95-4.95l-4.95-4.95l1.414-1.414z" />
                    </svg>
                </button>
            </header>
        </template>
        <nav class="tabs-container" v-if="!clonedVoice">
            <button :class="{ active: activeTab === 'library' }" @click="activeTab = 'library'">
                {{ $at('公开语音库') }}
            </button>
            <button :class="{ active: activeTab === 'mine' }" @click="activeTab = 'mine'">
                {{ $at('克隆声音') }}
            </button>
        </nav>
        <div class="content-area" v-if="activeTab === 'library'">
            <div class="filter-bar">
                <div class="gender-filters">
                    <button v-for="g in Gender" :key="g.value" :class="{ active: selectedGender === g.value }"
                        @click="selectedGender = g.value" class="filter-button">
                        {{ g.name }}
                    </button>
                </div>
            </div>
            <ul class="voice-list">
                <li v-for="voice in voiceList" :key="voice.id" class="voice-item">
                    <div class="voice-info">
                        <button class="play-button" @click="previewVoice(voice)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M8 5.14v13.72L19 12z" />
                            </svg>
                        </button>

                        <div class="voice-details">
                            <div class="voice-name">{{ voice.name }}</div>
                            <div class="voice-tags">
                                <span class="tag gender">{{ voice.gender === 'M' ? '男性' : '女性' }}</span>
                                <span class="tag accent">{{ voice.language }}</span>
                            </div>
                        </div>
                    </div>

                    <button class="use-button" @click="">{{ $at('使用') }}</button>
                </li>
            </ul>
        </div>
        <div class="content-area" v-if="activeTab === 'mine' && !clonedVoice">
            <div class="empty">
                <h3 class="title">{{ $at('开始克隆你的声音') }}</h3>
                <div class="sub-title">{{ $at('看来你还没有创作过任何内容！你可以使用我们的语音创作功能来创作，然后添加以供使用。') }}</div>
                <button class="create-button" @click="isCreate = true">
                    <el-icon>
                        <Headset />
                    </el-icon>
                    {{ $at('克隆新的声音') }}
                </button>
            </div>
        </div>
        <div v-if="clonedVoice">
            <div class="modal-content">
                <div class="voice-name-input">
                    <label for="voice-name">{{ $at('说出你的声音') }}</label>
                    <div class="input-container">
                        <input id="voice-name" type="text" v-model="voiceName" placeholder="Clone_20251202_01"
                            maxlength="20" />
                        <button class="clear-button" @click="voiceName = ''">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                <path fill="currentColor"
                                    d="m12 10.586l4.95-4.95l1.414 1.414l-4.95 4.95l4.95 4.95l-1.414 1.414l-4.95-4.95l-4.95 4.95l-1.414-1.414l4.95-4.95l-4.95-4.95l1.414-1.414z" />
                            </svg>
                        </button>
                        <span class="char-count">{{ voiceName.length }}/20</span>
                    </div>
                </div>

                <h3 class="section-title">{{ $at('上传样本') }}</h3>

                <div class="upload-options">
                    <div class="option-card upload-card">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7zM7 19h10v-2H7z" />
                        </svg>
                        <h4 class="upload-title-text">{{ $at('拖放文件或浏览') }}</h4>
                        <p>{{ $at('最大文件大小: 200 MB, 持续时间: 10-60 秒.') }}</p>
                    </div>

                    <div class="option-card record-card">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M12 14c2.21 0 4-1.79 4-4V5c0-2.21-1.79-4-4-4S8 2.79 8 5v5c0 2.21 1.79 4 4 4m-2 0v1.5c0 2.34 1.76 4.29 4 4.48V21h-4v-2H9v2h6v-2.02c2.24-.19 4-2.14 4-4.48V14h-2V5c0-1.1-.9-2-2-2s-2 .9-2 2v5c0 1.1.9 2 2 2s2-.9 2-2V5" />
                        </svg>
                        <h4 class="record-title-text">{{ $at('开始记录') }}</h4>
                        <p>{{ $at('点击录音并讲话 10-60 秒.') }}</p>
                    </div>
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
                <button class="btn btn-back" @click="isCreate = false">{{ $at('后退') }}</button>
                <button class="btn btn-clone" :disabled="!isConfirmed || voiceName.length === 0">{{ $at('克隆语音')
                    }}</button>
            </footer>
        </div>

    </el-dialog>
</template>

<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
// Define the structure for a voice tag
interface VoiceTag {
    label: string;
    class: string; // Used for potential specific styling (e.g., 'gender', 'age', 'attribute', 'accent')
}

// Define the structure for a voice item
interface VoiceItem {
    name: string;
    gender: string;
    tags: VoiceTag[];
}
const store = useVoiceStore();
const { voiceList } = storeToRefs(store)
const voiceName = ref('Clone_20251202_01');
const isConfirmed = ref(false); // State for the legal confirmation checkbox

const clonedVoice = computed(() => activeTab.value === 'mine' && isCreate.value)
const { isMobile } = useDevice()
const width = computed(() => isMobile.value ? '100%' : '50%')
const dialogVisible = defineModel<boolean>({
    default: true,
});
const isCreate = ref(false);
// Component State
const activeTab = ref<'library' | 'mine'>('library');
const selectedGender = ref<string>('ALL');
const Gender = [
    { name: $at('所有性别'), value: 'ALL' },
    { name: $at('男性'), value: 'M' },
    { name: $at('女性'), value: 'F' },
]

// 试听音色
const previewVoice = (item: any) => {
    store.preview({
        platform: item.platform,
        voice_type: item.voice_type,
    });
};
watch(selectedGender, (newGender) => {
    store.getVoice({
        page_index: 1,
        page_count: 50,
        gender: newGender,
        is_public: true,
    });
})
onMounted(() => {
    store.getVoice({
        page_index: 1,
        page_count: 50,
        gender: 'ALL',
        is_public: true,
    });
})
</script>

<style lang="scss" scoped>
@use "sass:color";
$primary-color: #4b89ff;
$error-red: #ff4b4b;
$info-yellow: #f8c940;

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

// --- Header ---
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;

    .modal-title {
        font-size: 20px;
        font-weight: 600;
    }

    .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
    }
}

// --- Tabs ---
.tabs-container {
    display: flex;
    gap: 20px;
    border-bottom: 1px solid var(--el-border-color);
    position: sticky;
    top: 0;
    z-index: 5;

    button {
        background: none;
        border: none;
        padding: 8px 0;
        font-size: 16px;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        transition: color 0.2s, border-bottom-color 0.2s;
        font-weight: 500;

        &.active {
            border-bottom-color: $primary-color;
            font-weight: 600;
        }
    }
}

// --- Content and Filters ---
.content-area {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 610px;
}

.filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0px;
    gap: 10px;

    .gender-filters {
        display: flex;
        align-items: center;
        gap: 10px;

        .filter-label {
            font-size: 14px;
            font-weight: 600;
        }

        .filter-button {
            background: none;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;

            &.active {
                background-color: $primary-color;
                color: white;
                font-weight: 600;
            }

            &:hover:not(.active) {
                background-color: var(--el-border-color);
            }
        }
    }
}

// --- Voice List ---
.voice-list {
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1;
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

.empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 30px;

    .create-button {
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 500;
        flex-shrink: 0;
        border: 1px solid var(--el-border-color);

        &:hover {
            background-color: rgba($color: transparent, $alpha: 0.8);
            color: white;
        }
    }
}

// --- Content Area ---
.modal-content {
    padding: 20px;
    flex-grow: 1;
    overflow-y: auto; // Allow content to scroll
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 15px;
}

// --- Voice Name Input ---
.voice-name-input {
    margin-bottom: 25px;

    label {
        display: block;
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .input-container {
        display: flex;
        align-items: center;
        border: 1px solid var(--el-border-color);
        border-radius: 6px;
        padding: 0 10px;

        input {
            flex-grow: 1;
            border: none;
            background: none;
            padding: 10px 0;
            font-size: 14px;

            &:focus {
                outline: none;
            }
        }

        .clear-button {
            background: none;
            border: none;
            cursor: pointer;
            margin-right: 5px;
        }

        .char-count {
            font-size: 13px;
            flex-shrink: 0;
        }
    }
}

// --- Upload/Record Cards ---
.upload-options {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
}

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
    padding: 20px;
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;

    svg {
        margin-bottom: 10px;
    }

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

.record-card {
    // Styling for the "Start Recording" card
    border-color: $error-red;

    svg {
        color: $error-red;
    }

    .record-title-text {
        color: $error-red;
    }

    &:hover {
        border-color: rgba($color: $error-red, $alpha: 1.0);
        background-color: rgba($error-red, 0.1);
    }
}

// --- Info Section ---
.info-section {
    margin-bottom: 20px;
}

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

// --- Custom Checkbox ---
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

// --- Footer Buttons ---
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

// ===================================
// --- Mobile/Tablet Responsiveness ---
// ===================================
@media (max-width: 768px) {

    .modal-header,
    .tabs-container {
        padding-left: 15px;
        padding-right: 15px;
    }

    .filter-bar {
        flex-direction: column; // Stack filters vertically
        align-items: flex-start;
        padding: 10px 15px;
    }

    .gender-filters {
        flex-wrap: wrap;

        .filter-label {
            width: 100%; // Make "所有性别" take a dedicated line
            margin-bottom: 5px;
        }
    }

    // Voice List Items Adaptation
    .voice-item {
        padding: 12px 15px; // Reduced vertical padding
    }

    .voice-name {
        font-size: 14px; // Slightly smaller text
    }

    .use-button {
        padding: 6px 12px; // Smaller use button
    }

    // Mobile Modal Sizing: Take up nearly the entire screen
    .cloning-modal {
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: none;
        border-radius: 0; // Full screen modal on mobile
    }

    .modal-header,
    .modal-footer {
        padding: 12px 15px; // Reduced padding
    }

    .modal-content {
        padding: 15px; // Reduced padding
    }

    // Upload/Record Cards Adaptation
    .upload-options {
        flex-direction: column; // Stack cards vertically
        gap: 15px;
    }

    .option-card {
        min-height: 100px; // Smaller minimum height
    }

    // Info Section and Checkbox Adaptation
    .info-box {
        font-size: 13px; // Smaller text
    }

    .confirmation-checkbox {
        .confirmation-text {
            font-size: 12px; // Smaller text
        }
    }

    // Footer Button Adaptation
    .modal-footer {
        justify-content: space-between; // Space between buttons

        .btn {
            flex: 1; // Make buttons equal width
        }
    }
}
</style>