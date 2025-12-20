<template>
    <div class="talkie-creator">
        <header class="talkie-creator__header">
            <div class="header-left" @click="router.back()">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
                <span class="draft-text">{{ $at('返回') }}</span>
            </div>
            <div class="header-right">
                <button class="btn btn-publish" @click="submit" v-loading="loading">{{ $at('提交审核') }}</button>
            </div>
        </header>
        <div class="talkie-creator__main-content">
            <section class="config-panel">
                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('创建你的人物') }}</h2>
                    <div class="input-group input-group-flex">
                        <label for="name">{{ $at('姓名') }}</label>
                        <el-input type="text" :placeholder="$at('请输入姓名')" v-model="config.name" maxlength="30"
                            show-word-limit />
                    </div>
                </div>
                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('性别') }}</h2>
                    <div class="input-group">
                        <el-radio-group v-model="config.gender">
                            <el-radio label="M">{{ $at('男') }}</el-radio>
                            <el-radio label="F">{{ $at('女') }}</el-radio>
                        </el-radio-group>
                    </div>
                </div>
                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('年龄') }}</h2>
                    <div class="input-group input-group-flex">
                        <el-input type="number" :placeholder="$at('请输入年龄')" v-model="config.age" :max="999" />
                    </div>
                </div>
                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('语言') }}</h2>
                    <div class="input-group input-group-flex">
                        <el-select v-model="config.language">
                            <el-option label="中文" value="zh-CN" />
                            <el-option label="英文" value="en-US" />
                        </el-select>
                    </div>
                </div>
                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('是否公开') }}</h2>
                    <div class="input-group">
                        <el-switch v-model="config.is_public" active-text="公开" inactive-text="不公开" />
                    </div>
                </div>
                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('提示词（影响角色的回复）') }}</h2>
                    <p class="section-description update-info"> **{{ $at('更新提示') }}:** {{ $at('不能被用户看到，仅影响对话效果') }} </p>
                    <p class="section-description">{{ $at('角色的提示词，包括所有背景信息、特征、角色与用户之间的关系等') }}</p>
                    <el-input type="textarea" v-model="config.prompt" :rows="8" show-word-limit maxlength="4000" />
                </div>
            </section>
            <section class="media-and-preview-panel">
                <div class="media-config">
                    <div class="header">
                        <div class="title-with-icon"><el-icon>
                                <PictureFilled />
                            </el-icon>{{ $at('图片') }}</div>
                    </div>
                    <p class="description"> {{ $at('添加图片，便于创建3D模型') }}</p>
                    <div class="upload-box">
                        <el-image :src="config.url" fit="cover" class="avatar" v-if="config.url" />
                        <el-upload class="avatar-uploader" action="#" list-type="picture-card" :auto-upload="false"
                            accept="image/*" :limit="1" @change="handleAvatarChange">
                            <el-icon>
                                <Plus />
                            </el-icon>
                        </el-upload>
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
                    <p class="description">{{ $at('选择人物的语音') }}</p>
                    <div class="placeholder-box" @click="voiceVisible = true" v-if="!voice.id">
                        <el-icon>
                            <Plus />
                        </el-icon>
                    </div>
                    <div class="voice-item" v-else>
                        <p class="voice-name">{{ voice.name }}</p>
                        <span class="tag accent">{{ voice.language }}</span>
                    </div>
                </div>
                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('开场白（不影响角色的回复）') }}</h2>
                    <p class="section-description">{{ $at('开场白，用于开始对话并设置对话基调') }}</p>
                    <el-input type="textarea" v-model="config.welcome_text" :placeholder="$at('输入开场白')" :rows="8"
                        show-word-limit maxlength="500" />
                </div>
                <div class="config-panel__section">
                    <h2 class="section-title">{{ $at('介绍（不影响角色的回复）') }}</h2>
                    <p class="section-description update-info"> **{{ $at('更新提示') }}:** {{ $at('角色的介绍不会影响对话效果') }}</p>
                    <p class="section-description">{{ $at('角色的介绍，用于展示角色的背景、特征、关系等') }}</p>
                    <el-input type="textarea" v-model="config.description" :placeholder="$at('输入角色的介绍')" :rows="8"
                        show-word-limit maxlength="500" />
                </div>
            </section>
            <section class="media-and-preview-panel">
                <!-- 模型预览/3D模型 -->

            </section>
        </div>
        <Voice v-model="voiceVisible" @select="selectVoice" />
    </div>
</template>

<script setup lang="ts">
import Voice from './voice.vue';
import { $at } from 'i18n-auto-extractor';
import { type UploadFile } from 'element-plus';
import { eq } from 'lodash';
const { GetModelDetail } = useAuditStore();
const { auditDetail } = storeToRefs(useAuditStore());
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const voice = ref<any>({});
const config = reactive<CreateAudit>({
    name: '',
    description: '',
    prompt: '',
    welcome_text: '',
    url: "",
    voice_id: '',
    gender: 'M',
    age: 0,
    language: 'zh-CN',
    is_public: false,
    tags: '',
});
const voiceVisible = ref(false);
const handleAvatarChange = async (file: UploadFile) => {
    if (!file.raw) return;
    try {
        const formData = new FormData();
        formData.append('file', file.raw);
        formData.append('file_type', "aimodel");
        const res = await fileUpload(formData);
        if (eq(res.code, 0)) {
            config.url = res.data.url || '';
        } else {
            ElMessage.error(res.msg || $at('文件上传失败'));
        };
    } catch (error) {
        ElMessage.error($at('文件上传失败'));
    };
};
const selectVoice = (item: any) => {
    config.voice_id = item.id;
    voice.value = item;
};
const submit = async () => {
    loading.value = true;
    try {
        // const res = route.query.id ? await updateAuditInfo({ ...config, id: Number(route.query.id) }) : await createUserModel(config);
        const res = await createUserModel(config);
        if (res.code === 0) {
            ElMessage.success($at('提交成功'));
            router.replace("/create");
        } else {
            ElMessage.error(res.msg || $at('提交失败'));
        };
    } catch (error) {
        ElMessage.error($at('提交失败'));
    } finally {
        loading.value = false;
    };
};
onMounted(async () => {
    console.log(route.query.id);
    if (route.query.id) {
        await GetModelDetail(Number(route.query.id));
        config.name = auditDetail.value.name || '';
        config.description = auditDetail.value.description || '';
        config.prompt = auditDetail.value.prompt || '';
        config.welcome_text = auditDetail.value.welcome_text || '';
        config.url = auditDetail.value.avatar_url || '';
        config.voice_id = auditDetail.value.voice_id || '';
        voice.value = auditDetail.value.voice || {};
    };
});
onUnmounted(() => {
    Object.assign(config, {
        name: '',
        description: '',
        prompt: '',
        welcome_text: '',
        images: new Blob(),
        voice_id: '',
    });
})
</script>

<style lang="scss" scoped>
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
        flex: 1;
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
        border-right: 1px solid var(--el-border-color);
    }
}

// --- Shared Panel Styles ---
.config-panel__section {
    background-color: var(--home-card-item-background);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 5px;

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

.input-group-flex {
    flex-direction: column;
    gap: 5px;
}

.input-group {
    margin-bottom: 15px;
    display: flex;
    align-items: center;

    label {
        flex: 1;
        width: 100%;
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
    transition: border-color 0.2s;
}

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

    .voice-name {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 4px;
    }

    .tag {
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 12px;
        background-color: #383838;
        white-space: nowrap;
        font-weight: 600;

        &.accent {
            background-color: #1a3a3a;
            color: #46b8b8;
        }
    }
}

.upload-box {
    display: flex;
    gap: 10px;

    .avatar {
        width: 148px;
        height: 148px;
        border: 1px solid var(--el-border-color);
        box-sizing: border-box;
        border-radius: 8px;
    }
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