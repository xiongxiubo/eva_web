<template>
    <div class="talkie-creator">
        <header class="talkie-creator__header">
            <div class="header-left" @click="router.push('/create')">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
                <span class="draft-text">{{ $at('返回') }}</span>
            </div>
            <div class="header-right">
                <button class="btn btn-save">{{ $at('保存') }}</button>
                <button class="btn btn-publish">{{ $at('发布') }}</button>
            </div>
        </header>

        <div class="talkie-creator__main-content">
            <section class="config-panel">
                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('创建你的人物') }}</h2>

                    <div class="input-group">
                        <label for="name">{{ $at('姓名') }}</label>
                        <input id="name" type="text" :placeholder="$at('请输入姓名')" v-model="config.name" maxlength="30" />
                        <span class="char-count">{{ config.name.length }}/30</span>
                    </div>

                    <div class="input-group">
                        <label for="gender">{{ $at('性别') }}</label>
                        <div class="radio-group">
                            <label class="radio-item">
                                <input type="radio" value="Male" v-model="config.gender" />
                                {{ $at('男') }}
                            </label>
                            <label class="radio-item">
                                <input type="radio" value="Female" v-model="config.gender" />
                                {{ $at('女') }}
                            </label>
                            <label class="radio-item">
                                <input type="radio" value="Non-Binary" v-model="config.gender" />
                                {{ $at('第三性别') }}
                            </label>
                        </div>
                    </div>
                </div>

                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('设置（影响角色的回复）') }}</h2>
                    <p class="section-description update-info">
                        **{{ $at('更新提示') }}:** {{ $at('不能被用户看到，仅影响对话效果') }}
                    </p>
                    <p class="section-description">
                        {{ $at('角色的设置，包括所有背景信息、特征、角色与用户之间的关系等') }}
                    </p>
                    <textarea v-model="config.settings" rows="5"></textarea>
                    <div class="mention-tags">
                        <span class="char-count">{{ config.settings.length }}/4000</span>
                    </div>
                </div>

                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('介绍（不影响角色的回复）') }}</h2>
                    <p class="section-description update-info">
                        **{{ $at('更新提示') }}:** {{ $at('角色的介绍不会影响对话效果') }}
                    </p>
                    <p class="section-description">
                        {{ $at('角色的介绍，用于展示角色的背景、特征、关系等') }}
                    </p>
                    <textarea v-model="config.intro" :placeholder="$at('输入角色的介绍')" rows="4"></textarea>
                    <span class="char-count">{{ config.intro.length }}/500</span>
                </div>

                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('开场白（不影响角色的回复）') }}</h2>
                    <p class="section-description">
                        {{ $at('开场白，用于开始对话并设置对话基调') }}
                    </p>
                    <textarea v-model="config.opening" :placeholder="$at('输入开场白')" rows="4"></textarea>
                    <span class="char-count">{{ config.opening.length }}/500</span>
                </div>
            </section>

            <section class="media-and-preview-panel">

                <div class="media-config">
                    <div class="header">
                        <div class="title-with-icon">
                            <el-icon>
                                <PictureFilled />
                            </el-icon>
                            {{ $at('图片') }}
                        </div>
                    </div>
                    <p class="description">
                        {{ $at('添加图片，便于创建3D模型') }}
                    </p>
                    <div class="placeholder-box">
                        <el-icon>
                            <Plus />
                        </el-icon>
                    </div>
                </div>

                <div class="media-config">
                    <div class="header">
                        <div class="title-with-icon">
                            <el-icon>
                                <Microphone />
                            </el-icon>
                            {{ $at('语音') }}
                        </div>
                    </div>
                    <p class="description">
                        {{ $at('选择人物的语音') }}
                    </p>
                    <div class="placeholder-box" @click="voiceVisible = true">
                        <el-icon>
                            <Plus />
                        </el-icon>
                    </div>
                </div>
            </section>
        </div>
        <Voice v-model="voiceVisible" />
    </div>
</template>

<script setup lang="ts">
import Voice from './voice.vue';
import { $at } from 'i18n-auto-extractor';
// Talkie Configuration State
interface TalkieConfig {
    name: string;
    gender: 'Male' | 'Female' | 'Non-Binary' | '';
    settings: string;
    intro: string;
    opening: string;
}
const router = useRouter();
const config = reactive<TalkieConfig>({
    name: '',
    gender: '',
    settings: '',
    intro: '',
    opening: '',
});
const voiceVisible = ref(false);
</script>

<style lang="scss" scoped>
$mid-bg: #2a2a2a;
$light-border: #383838;
$text-color: #d1d1d1;
$placeholder-color: #777;
$primary-color: #4b89ff;
$publish-color: #a04bff;

@mixin dark-scrollbars {
    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 4px;

        &:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }
    }

    &::-webkit-scrollbar-track {
        background-color: transparent;
    }
}

.talkie-creator {
    min-height: 100vh;
    background-color: var(--main-bg);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    @include dark-scrollbars;
}

// --- Header (Fixed at the top) ---
.talkie-creator__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: var(--el-header-bg-color);
    border-bottom: 1px solid var(--el-border-color);
    position: sticky;
    top: 0;
    z-index: 10;

    .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
    }

    .draft-text {
        font-size: 14px;
    }

    .header-right {
        display: flex;
        gap: 10px;
    }

    .btn {
        padding: 8px 15px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;

        &-save {
            background-color: transparent;
            border: 1px solid var(--el-border-color);

            &:hover {
                background-color: var(--el-menu-active-bg-color);
            }
        }

        &-publish {
            background-color: $publish-color;
            color: white;
        }
    }
}

// --- Main Content (Desktop: Dual Column) ---
.talkie-creator__main-content {
    display: flex;
    min-height: calc(100vh - 50px);

    .config-panel {
        flex: 2;
        min-width: 0;
        padding: 20px;
        border-right: 1px solid var(--el-border-color);
        overflow-y: auto;
    }

    .media-and-preview-panel {
        flex: 1; // Takes 1 part of the width (e.g., 33%)
        min-width: 0;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        overflow-y: auto;
    }
}

// --- Shared Panel Styles ---
.config-panel__section {
    background-color: var(--home-card-item-background);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;

    &:last-child {
        margin-bottom: 0;
    }

    .section-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;

        &.section-title--left-border {
            border-left: 3px solid var(--el-primary-color);
            padding-left: 10px;
        }
    }

    .section-description {
        font-size: 13px;
        margin-top: 5px;
        line-height: 1.4;

        &.update-info {
            font-style: italic;
            margin-bottom: 10px;
        }
    }

    .char-count {
        display: block;
        font-size: 12px;
        text-align: right;
        margin-top: 5px;
    }
}

// --- Input and Textarea Styles ---
input[type='text'],
textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    resize: vertical;
    margin-top: 10px;

    &:focus {
        outline: none;
        border-color: var(--el-border-color);
    }
}

.input-group {
    margin-bottom: 15px;

    label {
        display: block;
        font-size: 14px;
        margin-bottom: 5px;
    }
}

// --- Radio Group ---
.radio-group {
    display: flex;
    gap: 15px;
    margin-top: 5px;

    .radio-item {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 14px;

        input[type='radio'] {
            appearance: none;
            width: 16px;
            height: 16px;
            margin-right: 5px;
            border: 1px solid var(--el-border-color);
            border-radius: 50%;
            cursor: pointer;
            position: relative;
            top: 0;

            &:checked {
                background-color: $primary-color;
                border-color: $primary-color;

                &::after {
                    content: '';
                    display: block;
                    width: 6px;
                    height: 6px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
    }
}

// --- Mention Tags ---
.mention-tags {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;

    .char-count {
        margin-left: auto; // Pushes count to the far right
    }
}

// --- Media Config Panels (Right Side) ---
.media-config {
    background-color: var(--home-card-item-background);
    padding: 15px;
    border-radius: 8px;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .title-with-icon {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-weight: 600;
            gap: 5px;
        }
    }

    .description {
        font-size: 13px;
        margin-bottom: 15px;
    }
}

.placeholder-box {
    background-color: var(--home-card-item-background);
    border: 1px dashed var(--el-border-color);
    border-radius: 4px;
    height: 72px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: $placeholder-color;
    transition: border-color 0.2s;
}

@media (max-width: 900px) {
    .talkie-creator__main-content {
        flex-direction: column; // Stack columns vertically on mobile

        .config-panel {
            border-right: none; // Remove separator line
            border-bottom: 1px solid var(--el-border-color);
            padding: 15px;
        }

        .media-and-preview-panel {
            padding: 15px;
        }
    }

    .config-panel__section {
        padding: 15px;
    }

    .mention-tags {
        flex-wrap: wrap; // Allow tags to wrap on small screens

        .char-count {
            flex-basis: 100%; // Make the char-count take a new line
            margin-top: 10px;
        }
    }

    .radio-group {
        flex-direction: column; // Stack radio buttons vertically for better tapping
        gap: 10px;
    }
}
</style>