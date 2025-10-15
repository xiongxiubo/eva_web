<template>
  <MainPage>
    <div class="speaker">
      <Card_pagination :page="page_index" :size="page_size" :total="total">
        <template #header>
          <div class="card-header">
            <span>{{ $at('说话人') }}</span>
            <el-button :icon="Plus" type="primary" size="small" @click="dialogVisible = true">{{ $at('添加说话人')
            }}</el-button>
          </div>
        </template>
        <el-table :data="SpeakerList" style="width: 100%">
          <el-table-column prop="speaker" :label="$at('说话人')" width="200px">
            <template #default="scope">
              <el-input v-model="scope.row.speaker" @blur="putSpeaker(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="created_at" :label="$at('创建时间')" />
          <el-table-column prop="audio_data" :label="$at('试听')">
            <template #default="scope">
              <el-button :icon="Service" @click="playPCM(scope.row.audio_data)" />
            </template>
          </el-table-column>
          <el-table-column prop="active" :label="$at('操作')" width="200px" align="center">
            <template #default="scope">
              <el-button type="danger" size="small" @click="delSpeaker(scope.row)">{{ $at('删除') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </Card_pagination>
      <el-dialog v-model="dialogVisible" :title="$at('添加说话人')" width="800">
        <el-form :model="speaker" :rules="rules" ref="speakerForm" label-width="80px">
          <el-form-item :label="$at('说话人')" prop="speaker">
            <el-input v-model="speaker.speaker" :placeholder="$at('请输入说话人')" />
          </el-form-item>
          <el-form-item :label="$at('录制音频')" prop="audio_data">
            <el-button :icon="Microphone" @click="startRecording()" :loading="isRecording">
              {{ isRecording ? $at('录制中...') : $at('点击录制') }}
            </el-button>
            <el-tooltip class="item" content="播放录音" placement="top">
              <el-button v-if="pcm_data !== ''" :icon="Headset" @click="playPcm" />
            </el-tooltip>
          </el-form-item>
          <el-form-item>
            <Button :type="'primary'" @submit="submitForm">{{ $at('提交') }}</Button>
          </el-form-item>
        </el-form>
      </el-dialog>

    </div>
  </MainPage>

</template>
<script setup lang="ts">
import { Service, Headset, Plus, Microphone, MessageBox } from "@element-plus/icons-vue"
import { playPCM } from '@/utils/baseToaudio';
import { $at } from 'i18n-auto-extractor';
import { eq, get } from 'lodash';
import { ElMessageBox } from "element-plus";
const SpeakerList = ref<any[]>([])
const dialogVisible = ref<boolean>(false)
const { startRecording, isRecording, pcm_data, playPcm } = useRecording();
const speakerForm = ref<any>()
const speaker = reactive({
  speaker: "",
  audio_data: computed(() => pcm_data.value)
});
const page_index = ref<number>(1)
const page_size = ref<number>(10)
const total = ref<number>(0)
const rules = reactive({
  speaker: [
    { required: true, message: $at('请选择说话人'), trigger: 'blur' }
  ],
  audio_data: [
    { required: true, message: $at('请录制音频'), trigger: 'blur' }
  ]
});

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
  width: 80%;
  height: 100%;
  padding: 20px 0;
  margin: 0 auto;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .el-form {
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
  }
}
</style>
