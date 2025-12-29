<template>
  <MainPage>
    <div class="speaker">
      <div class="header">
        <div class="title">{{ $at('说话人') }} </div>
        <button class="create-btn" @click="dialogVisible = true">
          <el-icon style="width:16px; margin-right:4px">
            <Plus />
          </el-icon>
          <span class="btn-text"> {{ $at('添加说话人') }}</span>
        </button>
      </div>

      <div class="cards">
        <AudioCard v-for="item in SpeakerList" :key="item.id" :item="item" @delete="del" />
        <!-- <div class="item" v-for="item in SpeakerList" :key="item.id">
          <div class="name" v-if="isHover !== item.ID">
            {{ item.speaker }}
            <el-icon @click="isHover = item.ID">
              <Edit />
            </el-icon>
          </div>
          <div class="name" v-else>
            <el-input v-model="item.speaker" @blur="isHover = 0" @keyup.enter="putSpeaker(item)" />
          </div>
          <div class="audio">
            <audio class="no-volume" controls controlslist="nodownload noplaybackrate nofullscreen"
              :src="pcmBase64ToAudioUrl(item.audio_data)"></audio>
          </div>
          <div class="footer">
            <div class="time">{{ formatTime(item.created_at) }}</div>
            <el-button :icon="Delete" type="danger" @click="delSpeaker(item)" circle />
          </div>
        </div> -->
      </div>

      <Pagination v-model:page="page_index" v-model:size="page_size" v-model:total="total" />

      <el-dialog v-model="dialogVisible" :show-close="false" :width="width">
        <div class="modal-content">
          <div class="voice-name-input">
            <label for="voice-name">{{ $at('说出你的声音') }}</label>
            <el-input v-model="speaker.speaker" maxlength="20" :placeholder="$at('请输入20个字符以内')" show-word-limit
              type="text" />
          </div>
          <h3 class="section-title">{{ $at('上传样本') }}</h3>
          <div class="upload-options">
            <Record class="option-card " @record-end="recordEnd" ref="recordRef" />
          </div>
          <div class="info-section">
            <div class="info-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8" />
              </svg>
              <p>
                {{ $at('请上传说话人的声音的音频样本。') }}
                <br />
                **{{ $at('样本质量比数量更重要。') }}** {{ $at('噪声较大的样本可能会导致糟糕的结果。提供超过10秒的音频对提升效果帮助不大。') }}
              </p>
            </div>

            <label class="confirmation-checkbox">
              <input type="checkbox" v-model="isConfirmed" />
              <span class="checkmark"></span>
              <span class="confirmation-text">
                {{ $at('我在此确认，我拥有上传的这些语音样本的所有必要权利和许可。') }}
              </span>
            </label>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn btn-back" @click="dialogVisible = false">{{ $at('取消') }}</button>
          <button class="btn btn-clone" v-loading="loading" :disabled="speaker.speaker.length === 0"
            @click="submitForm">
            {{ $at('克隆语音') }}
          </button>
        </footer>
      </el-dialog>
    </div>
  </MainPage>

</template>
<script setup lang="ts">
import Record from './Record.vue';
import AudioCard from './AudioCard.vue'
import { Plus } from "@element-plus/icons-vue"
import { $at } from 'i18n-auto-extractor';
import { eq, get } from 'lodash';
const { isMobile } = useDevice();
const loading = ref(false);
const isConfirmed = ref(false);
const width = computed(() => isMobile.value ? '100%' : '50%');
const SpeakerList = ref<any[]>([]);
const dialogVisible = ref<boolean>(false);
const recordRef = ref<any>(null);

const speaker = reactive({
  speaker: "",
  audio_data: ""
});
const page_index = ref<number>(1);
const page_size = ref<number>(10);
const total = ref<number>(0);
const recordEnd = (b: string) => speaker.audio_data = b;
const getSpeaker = async () => {
  try {
    const res = await getSpeakerList({
      page_index: page_index.value,
      page_count: page_size.value
    });
    if (eq(res.code, 0)) {
      SpeakerList.value = get(res.data, 'list', []) || [];
      total.value = get(res.data, 'total', 0);
      console.log(SpeakerList.value);
    };
  } catch (error) {
    console.log(error);
  };
};
const del = () => { getSpeaker() }
const submitForm = async () => {
  try {
    if (!isConfirmed.value) return ElMessage.error($at('请先确认条款'));
    if (speaker.audio_data.length === 0) return ElMessage.error($at('请上传样本'));
    if (speaker.speaker.length === 0) return ElMessage.error($at('请输入说话人'));
    loading.value = true;
    const res = await addSpeaker(speaker);
    if (eq(res.code, 0)) {
      dialogVisible.value = false;
      getSpeaker();
    };
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
    speaker.speaker = "";
    speaker.audio_data = "";
    isConfirmed.value = false;
    recordRef.value.resetRecord();
  }
};
onMounted(() => {
  getSpeaker();
});

</script>
<style scoped lang="scss">
@use "sass:color";
$info-yellow: #f8c940;
$primary-color: #4b89ff;

.create-btn {
  background-color: var(--el-menu-active-bg-color);
  color: var(--menu-active-color);
  border: 1px solid var(--el-menu-border-color);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.speaker {
  width: 100%;
  height: 100%;
  padding: 20px 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 20px;

    .title {
      font-size: 24px;
      font-weight: bold;
    }
  }



  .cards {
    display: grid;
    gap: 1.25rem;
    padding: 0 10px;
    margin-bottom: 20px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }

  .submit {
    width: 100%;
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
}
</style>
