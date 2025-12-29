<template>
    <MainPage>
        <div class="memory">
            <div class="title">
                {{ $at('记忆') }}
            </div>
            <div class="list">
                <div class="item" v-for="(item, index) in MemoryList" :key="index"
                    @click="router.push(`/chathistory/${item.talkie_id}`)">
                    <img :src="item.talkie_avatar" class="avatar">
                    <div class="header">
                        <div class="ainame">{{ item.talkie_name }}</div>
                        <div class="time">{{ $at('最后通话') }}：{{ timeFromNow(item.last_talk_time, currentLang) }}</div>
                    </div>
                    <div class="content">
                        <div class="text">
                            {{ item.talk_summary }}
                        </div>
                    </div>
                    <div class="footer">
                        <div class="ainame">
                            <el-avatar :src="item.talkie_avatar" :size="24" />
                            <span>{{ item.talkie_name }}</span>
                            <span>x</span>
                            <el-avatar :src="generateAvatar(user.Email)" :size="24" />
                            <span>{{ user.username }}</span>
                        </div>
                        <div class="count">
                            <el-icon>
                                <Phone />
                            </el-icon>： {{ item.talk_count }}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </MainPage>

</template>
<script setup lang="ts">
import { generateAvatar } from '@/utils/utils';
import { $at } from 'i18n-auto-extractor';
import { timeFromNow } from '@/utils/time';
const { currentLang } = storeToRefs(useLangStore())
const { MemoryList } = storeToRefs(useMemoryStore());
const { user } = storeToRefs(useUserStore());
const router = useRouter();

onMounted(() => {
    useMemoryStore().GetMemory();
});
</script>
<style scoped lang="scss">
.memory {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;

    .title {
        font-size: 24px;
        font-weight: bold;
        width: 100%;
        margin-bottom: 20px;
    }

    .list {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 20px;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }

        .item {
            border: 1px solid var(--el-border-color);
            border-radius: 8px;
            width: 100%;
            padding: 20px;
            padding-bottom: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 20px;
            background: hsla(0, 0%, 100%, .102);
            // background-image: linear-gradient(to right, rgba(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%);
            background-repeat: no-repeat;
            background-position: 100% 0;
            background-size: cover;
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            position: relative;
            overflow: hidden;

            .avatar {
                width: 100%;
                height: 100%;
                object-fit: cover;
                filter: blur(50px);
                position: absolute;
                left: 0;
                top: 0;
                z-index: 1;

            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 2;
            }

            .content {
                z-index: 2;
            }

            .footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-top: 1px solid var(--el-border-color);
                margin-top: auto;
                z-index: 2;


                .ainame {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .el-avatar {
                        border: 1px solid var(--el-border-color);
                    }
                }

                .count {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
            }
        }
    }

}
</style>
