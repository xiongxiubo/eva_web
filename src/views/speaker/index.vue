<template>
  <MainPage>
    <div class="speaker">
      <h1>{{ $at('说话人') }}</h1>

      <el-form :model="speaker" :rules="rules" ref="speakerForm" label-width="80px">
        <el-form-item :label="$at('说话人')" prop="speaker">
          <el-select v-model="speaker.speaker" :placeholder="$at('请选择说话人')" filterable>
            <el-option v-for="item in SpeakerList" :key="item.ID" :label="item.speaker" :value="item.ID">
              <div class="speaker-item">
                <span>{{ item.speaker }}</span>
                <el-icon @click="playPCM(item.audio_data)">
                  <VideoPlay />
                </el-icon>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </MainPage>

</template>
<script setup lang="ts">
import { playPCM } from '@/utils/baseToaudio';
import { $at } from 'i18n-auto-extractor';
import { eq } from 'lodash';
const SpeakerList = ref<any[]>([])
const speaker = reactive({
  speaker: ""
});
const rules = reactive({
  speaker: [
    { required: true, message: $at('请选择说话人'), trigger: 'blur' }
  ]
});

const getSpeaker = async () => {
  try {
    const res = await getSpeakerList({
      page_index: 1,
      page_count: 10
    })
    if (eq(res.code, 0)) {
      SpeakerList.value = res.data.list || []
      console.log(SpeakerList.value)
    }
  } catch (error) {
    console.log(error)
  }
}
onMounted(() => {
  getSpeaker()
})

</script>
<style scoped lang="scss">
.speaker {
  width: 100%;
  height: 100%;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .el-form{
    width: 300px;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
    .speaker-item{
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
  }
}
</style>
