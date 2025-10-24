<template>
  <MainPage>
    <div class="speaker">
      <div class="header">
        <div class="title">{{ $at('说话人') }} </div>
        <el-button :icon="Plus" @click="dialogVisible = true">
          {{ $at('添加说话人') }}
        </el-button>
      </div>

      <div class="cards">
        <div class="item" v-for="item in SpeakerList" :key="item.id">
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
        </div>
      </div>

      <Pagination v-model:page="page_index" v-model:size="page_size" v-model:total="total" />

      <el-dialog v-model="dialogVisible" :title="$at('添加说话人')" :width="300" align-center destroy-on-close>
        <el-form :model="speaker" label-position="top" :rules="rules" ref="speakerForm" label-width="80px">
          <el-form-item :label="$at('说话人')" prop="speaker">
            <el-input v-model="speaker.speaker" :placeholder="$at('请输入说话人')" />
          </el-form-item>
          <el-form-item :label="$at('音频')" prop="audio_data">
            <AudioRecorder @recorded="handleRecorded" />
          </el-form-item>
          <el-button class="submit" @click="submitForm">{{ $at('提交') }}</el-button>
        </el-form>
      </el-dialog>
    </div>
  </MainPage>

</template>
<script setup lang="ts">
import AudioRecorder from './AudioRecorder.vue'
import { Delete, Plus } from "@element-plus/icons-vue"
import { pcmBase64ToAudioUrl } from '@/utils/baseToaudio';
import { formatTime } from '@/utils/time';
import { $at } from 'i18n-auto-extractor';
import { eq, get } from 'lodash';
import { ElMessageBox } from "element-plus";
const SpeakerList = ref<any[]>([])
const dialogVisible = ref<boolean>(false)
const speakerForm = ref<any>()
const speaker = reactive({
  speaker: "",
  audio_data: ""
});
const isHover = ref<number>(0)
const page_index = ref<number>(1)
const page_size = ref<number>(10)
const total = ref<number>(0)
const rules = reactive({
  speaker: [
    { required: true, message: $at('请输入说话人'), trigger: 'blur' }
  ],
  audio_data: [
    { required: true, message: $at('请录制音频'), trigger: 'blur' }
  ]
});

const handleRecorded = (pcm_data: string) => speaker.audio_data = pcm_data;

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

const submitForm = async () => {
  try {
    const valid = await speakerForm.value.validate();
    if (!valid) return;
    const res = await addSpeaker(speaker);
    if (eq(res.code, 0)) {
      dialogVisible.value = false;
      getSpeaker();
    };
  } catch (error) {
    console.log(error);
  };
};

const delSpeaker = async (row: any) => {
  ElMessageBox.confirm($at('确定删除说话人吗？'), $at('提示'), {
    confirmButtonText: $at('确定'),
    cancelButtonText: $at('取消'),
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteSpeaker(row.ID);
      if (eq(res.code, 0)) {
        ElMessage.success($at('删除成功'));
        getSpeaker();
      } else {
        ElMessage.error($at('删除失败'));
      }
    } catch (error) {
      console.log(error);
    };
  });
};

const putSpeaker = async (row: any) => {
  ElMessageBox.confirm($at(`确定将说话人修改成 `) + row.speaker + $at(' 吗？'), $at('提示'), {
    confirmButtonText: $at('确定'),
    cancelButtonText: $at('取消'),
    type: 'warning'
  }).then(async () => {
    try {
      const res = await updateSpeaker({
        audio_id: row.ID,
        speaker: row.speaker
      });
      if (eq(res.code, 0)) {
        ElMessage.success($at('修改成功'));
        isHover.value = 0;
      } else {
        ElMessage.error($at('修改失败'));
      }
    } catch (error) {
      console.log(error);
    };
  });
};
onMounted(() => {
  getSpeaker();
});

</script>
<style scoped lang="scss">
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
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    padding: 0 10px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      display: grid;
      justify-items: center;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .item {
      width: 13rem;
      background: var(--home-crad-item-background);
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      gap: 1.25rem;
      border-radius: 8px;
      border: 1px solid var(--el-border-color);
      box-sizing: border-box;

      @media (max-width: 768px) {
        width: 10rem;
      }

      .name {
        width: 100%;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 10px;

        .el-icon {
          cursor: pointer;
        }
      }

      .audio {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;


        .no-volume {
          width: 100%;
          height: 40px;
        }
      }

      .footer {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .time {
          font-size: 0.8rem;
        }
      }
    }
  }

  .submit {
    width: 100%;
  }
}
</style>
