<template>
    <div class="record-card" @click="isRecording ? stopRecord() : startRecord()">
        <el-icon :size="24">
            <Mic />
        </el-icon>
        <AVMedia v-if="stream && isRecording" :media="stream" type="wform" line-color="#ff4b4b" />
        <h4 class="record-title-text">{{ isRecording ? $at('停止记录') : $at('开始记录') }}</h4>
        <p v-if="recordDuration > 0">{{ $at('录音时长') }} {{ recordDuration }} {{ $at('秒') }}</p>
        <p v-else>{{ $at('点击录音并讲话 10-60 秒.') }}</p>
    </div>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';
import { AVMedia } from 'vue-audio-visual';
import { useUserMedia } from '@vueuse/core';
const { stream, start, stop } = useUserMedia({ constraints: { audio: true } });
const audioContext = ref<AudioContext | null>(null);
const sourceNode = ref<MediaStreamAudioSourceNode | null>(null);
const workletNode = ref<AudioWorkletNode | null>(null);
const isRecording = ref(false);
const recordDuration = ref(0);
const buffer = ref<Float32Array[]>([]);
let recordEndTime: number | null = null;
let autoStopTimer: number | null = null; // 自动停止 timer
const emit = defineEmits(['recordEnd']);
async function startRecord() {
    if (isRecording.value) return;
    await start();
    isRecording.value = true;
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    sourceNode.value = audioContext.value.createMediaStreamSource(stream.value!);
    await audioContext.value.audioWorklet.addModule("/script/recorder-processor.js");
    workletNode.value = new AudioWorkletNode(audioContext.value, 'opus-recorder-processor');
    workletNode.value.port.onmessage = (e) => {
        buffer.value.push(new Float32Array(e.data.buffer));
    }
    workletNode.value.port.postMessage({ command: "start" });
    sourceNode.value.connect(workletNode.value);

    let recordStartTime = Date.now();
    recordEndTime = window.setInterval(() => {
        recordDuration.value = Math.floor((Date.now() - recordStartTime) / 1000);//取整
    }, 1000);
    // 60s 后自动停止
    autoStopTimer = window.setTimeout(stopRecord, 60000);
};
function stopRecord() {
    if (!isRecording.value) return;
    isRecording.value = false;
    // 清理 timer
    if (recordEndTime) {
        clearInterval(recordEndTime);
        recordEndTime = null;
    }
    if (autoStopTimer) {
        clearTimeout(autoStopTimer);
        autoStopTimer = null;
    }
    // 清理 workletNode
    workletNode.value?.port.postMessage({ command: "stop" });
    workletNode.value?.disconnect();
    sourceNode.value?.disconnect();
    stop();
    audioContext.value?.close();
    const blob = encodeWav16bit(buffer.value, 16000); // 保存录音文件
    emit('recordEnd', blob);
    buffer.value = [];
};
</script>
<style scoped lang="scss">
$error-red: #ff4b4b;

.record-card {
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
</style>