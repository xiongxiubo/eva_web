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
            <el-scrollbar @end-reached="loadMore" ref="scrollbar">
                <ul class="voice-list">
                    <li v-for="voice in voiceList" :key="voice.id" class="voice-item">
                        <div class="voice-info">
                            <Audio :src="voice.sample_audio_url || voice.voice_url" />
                            <div class="voice-details">
                                <div class="voice-name">{{ voice.name }}</div>
                                <div class="voice-tags">
                                    <span class="tag gender">{{ getGender(voice.gender) }}</span>
                                    <span class="tag accent">{{ voice.language }}</span>
                                </div>
                            </div>
                        </div>
                        <button class="use-button" @click="selectVoice(voice)">{{ $at('使用') }}</button>
                    </li>
                </ul>
            </el-scrollbar>
        </div>
        <div class="content-area" v-if="activeTab === 'mine' && !clonedVoice">
            <div class="empty" v-if="userVoiceList.length === 0">
                <h3 class="title">{{ $at('开始克隆你的声音') }}</h3>
                <div class="sub-title">{{ $at('看来你还没有创作过任何内容！你可以使用我们的语音创作功能来创作，然后添加以供使用。') }}</div>
                <button class="create-button" @click="$router.push('/create/voice')">
                    <el-icon>
                        <Headset />
                    </el-icon>
                    {{ $at('克隆新的声音') }}
                </button>
            </div>
            <ul class="voice-list" v-else>
                <li v-for="voice in userVoiceList" :key="voice.id" class="voice-item">
                    <div class="voice-info">
                        <Audio :src="voice.sample_audio_url || voice.voice_url" />
                        <div class="voice-details">
                            <div class="voice-name">{{ voice.name }}</div>
                            <div class="voice-tags">
                                <span class="tag gender">{{ voice.gender === 'M' ? '男性' : '女性' }}</span>
                                <span class="tag accent">{{ voice.language }}</span>
                            </div>
                        </div>
                    </div>
                    <button class="use-button" @click="selectVoice(voice)">{{ $at('使用') }}</button>
                </li>
            </ul>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import type { ScrollbarDirection } from 'element-plus';
import { $at } from 'i18n-auto-extractor';
const store = useVoiceStore();
const { voiceList, userVoiceList } = storeToRefs(store)
const clonedVoice = computed(() => activeTab.value === 'mine' && isCreate.value)
const { isMobile } = useDevice()
const width = computed(() => isMobile.value ? '100%' : '50%')
const dialogVisible = defineModel<boolean>({ default: true });
const emits = defineEmits(['select'])
const isCreate = ref(false);
const activeTab = ref<'library' | 'mine'>('library');
const selectedGender = ref<string>('ALL');
const audio = ref<any>();
const Gender = [
    { name: $at('所有性别'), value: 'ALL' },
    { name: $at('男性'), value: 'M' },
    { name: $at('女性'), value: 'F' },
];
const page_index = ref(1);
const scrollbar = ref<any>();
const getGender = (gender: string) => {
    switch (gender) {
        case 'M':
            return $at('男性');
        case 'F':
            return $at('女性');
        default:
            return $at('未知');
    };
};

const loadMore = (direction: ScrollbarDirection) => {
    if (direction === 'bottom') {
        page_index.value++;
        store.getVoice({
            page_index: page_index.value,
            page_count: 50,
            gender: selectedGender.value,
            is_public: 1,
        });
    }
}

watch(selectedGender, (newGender) => {
    page_index.value = 1;
    store.getVoice({
        page_index: page_index.value,
        page_count: 50,
        gender: newGender,
        is_public: 1,
    });
    scrollbar.value?.setScrollTop(0);
});

const selectVoice = (item: any) => {
    emits('select', item);
    dialogVisible.value = false;
};

onMounted(() => {
    store.getVoice({
        page_index: page_index.value,
        page_count: 50,
        gender: 'ALL',
        is_public: 1,
    });
    store.getUserVoice();
});
</script>

<style lang="scss" scoped>
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
}
</style>