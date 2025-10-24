<template>
    <div class="audio-recorder">
        <!-- 左侧：录音按钮,长按录音松开结束录音 -->
        <el-tooltip content="长按录音松开结束录音" placement="top">
            <el-button type="primary" :icon="Microphone" @mousedown="toggleRecording" @mouseup="toggleRecording"
                circle />
        </el-tooltip>
        <!-- 中间：时间 + 试听 -->
        <div class="middle">
            <span class="timer">{{ formattedTime }}</span>
            <el-button type="success" :icon="VideoPlay" size="small" :disabled="!pcm_float32.byteLength"
                @click="playAudio">
                试听
            </el-button>
        </div>

        <!-- 右侧：重置 -->
        <el-button type="warning" :icon="Refresh" circle :disabled="!pcm_float32.byteLength" @click="resetAudio" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import { ElButton } from "element-plus";
import { Microphone, VideoPlay, Refresh } from "@element-plus/icons-vue";

const isRecording = ref(false);
const startTime = ref<number | null>(null);
const timer = ref(0);
const timerInterval = ref<number | null>(null);
const audioContext = ref<AudioContext | null>(null);
const mediaStream = ref<MediaStream | null>(null);
const workletNode = ref<AudioWorkletNode | null>(null);
const audioBufferData = ref<Float32Array[]>([]);
const pcm_data = ref<string>("");
const pcm_float32 = ref<any>(new Float32Array(0));
const SampleRate = ref<number>(48000);
const emits = defineEmits(["recorded"]);

// 格式化录音时间
const formattedTime = computed(() => {
    const total = Math.floor(timer.value);
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
});

// 更新时间
const updateTimer = () => {
    if (startTime.value) {
        timer.value = (Date.now() - startTime.value) / 1000;
    };
};

// 开始/停止录音
const toggleRecording = async () => {
    if (!isRecording.value) {
        try {
            audioContext.value = new AudioContext();
            SampleRate.value = audioContext.value.sampleRate;
            mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
            const sourceNode = audioContext.value.createMediaStreamSource(mediaStream.value);
            await audioContext.value.audioWorklet.addModule("/script/recording.js");
            workletNode.value = new AudioWorkletNode(audioContext.value, "recorder-processor");
            workletNode.value.port.onmessage = event => {
                audioBufferData.value.push(new Float32Array(event.data));
            };
            sourceNode.connect(workletNode.value);
            workletNode.value.connect(audioContext.value.destination);

            isRecording.value = true;
            startTime.value = Date.now();
            timer.value = 0;
            timerInterval.value = window.setInterval(updateTimer, 500);
        } catch (err) {
            console.error("录音启动失败：", err);
        };
    } else {
        stopRecording();
    };
};

// 停止录音
const stopRecording = async () => {
    if (!isRecording.value) return;
    isRecording.value = false;
    workletNode.value?.disconnect();
    mediaStream.value?.getTracks().forEach(track => track.stop());
    audioContext.value?.close();
    // 合并pcm
    const totalLength = audioBufferData.value.reduce((acc, cur) => acc + cur.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of audioBufferData.value) {
        merged.set(chunk, offset);
        offset += chunk.length;
    }
    pcm_data.value = arrayBufferToBase64(floatTo16BitPCM(await resampleTo48000(merged, SampleRate.value)));
    // 生成音频 URL
    pcm_float32.value = merged;
    emits("recorded", pcm_data.value);
    if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
    };
};
// float32 -> 16bit PCM
const floatTo16BitPCM = (float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    };
    return buffer;
};
// 工具：重采样到 48kHz
async function resampleTo48000(float32Pcm: Float32Array<ArrayBuffer>, originalRate: number) {
    if (originalRate === 48000) return float32Pcm;

    const duration = float32Pcm.length / originalRate;
    const offlineCtx = new OfflineAudioContext(1, duration * 48000, 48000);
    const buffer = offlineCtx.createBuffer(1, float32Pcm.length, originalRate);
    buffer.copyToChannel(float32Pcm, 0);

    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const rendered = await offlineCtx.startRendering();
    return rendered.getChannelData(0);
};
// pcm 转 base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    };
    return btoa(binary); // 转 base64
};

// 播放音频
const playAudio = () => {
    if (pcm_float32.value.byteLength === 0) return;
    // 3. 用 Web Audio 播放 PCM 数据
    const audioCtx = new AudioContext();
    const buffer = audioCtx.createBuffer(1, pcm_float32.value.length, audioCtx.sampleRate);
    buffer.copyToChannel(pcm_float32.value, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
};

// 重置
const resetAudio = () => {
    stopRecording();
    timer.value = 0;
    pcm_float32.value = new Float32Array(0);
    isRecording.value = false;
};

onUnmounted(() => {
    if (timerInterval.value) clearInterval(timerInterval.value);
    stopRecording();
});
</script>

<style scoped>
.audio-recorder {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color);
    border-radius: 12px;
    padding: 12px 16px;
    box-sizing: border-box;
}

.middle {
    display: flex;
    align-items: center;
    gap: 10px;
}

.timer {
    font-weight: 600;
    color: var(--el-text-color-primary);
    width: 50px;
    text-align: center;
}
</style>
