<template>
    <div class="logo">
        <div class="logo-content" @click="router.push('/')">
            <Logo />
            <span>Aianace</span>
        </div>

    </div>
    <el-menu-item index="/">
        <el-icon>
            <House />
        </el-icon>
        <template #title>
            <span>{{ $at('首页') }}</span>
        </template>
    </el-menu-item>
    <el-menu-item index="/memory">
        <el-icon>
            <Connection />
        </el-icon>
        <template #title>
            <span>{{ $at('记忆') }}</span>
        </template>
    </el-menu-item>
    <el-menu-item index="/speaker">
        <el-icon>
            <Microphone />
        </el-icon>
        <template #title>
            <span>{{ $at('说话人') }}</span>
        </template>
    </el-menu-item>
    <h4 class="chat-title">{{ $at('聊天') }}</h4>
    <div class="chat-list">
        <div class="chat-item" v-for="item in chatList" :key="item.id" @click="router.push(`/chat/${item.talkie_id}`)"
            @mouseenter="hoverChat(item.id)" @mouseleave="leaveChat">
            <el-avatar :src="item.avatar" :size="32" />
            <span>{{ item.name }}</span>
            <el-button v-show="isHover && hoverId === item.id" :icon="CloseBold" circle class="more-btn"
                @click.stop="deleteChat(item.talkie_id)" />
        </div>
    </div>
    <div class="foot">
        <div class="externallinks">
            <div class="item" v-for="item in link" :key="item.name" @click="openUrl(item.url)">
                <el-icon>
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4831">
                        <path :d="item.icon" p-id="4832" fill="#96979b"></path>
                    </svg>
                </el-icon>
                <span>{{ item.name }}</span>
                <el-icon>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M5 5V19H19V12H21V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H12V5H5ZM14 5V3H21V10H19V6.41L9.17 16.24L7.76 14.83L17.59 5H14Z"
                            fill="currentColor"></path>
                    </svg>
                </el-icon>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Logo from '@/components/logo.vue'
import { $at } from 'i18n-auto-extractor';
import { CloseBold, } from '@element-plus/icons-vue';
const storage = useUserStore();
const { chatList, isCollapse } = storeToRefs(storage);
const router = useRouter();
const isHover = ref(false);
const hoverId = ref(0);
const { isMobile } = useDevice()

const link = [
    { icon: svg.twitter, name: 'Twitter', url: '#' },
    { icon: svg.github, name: 'GitHub', url: "#" },
    { icon: svg.telegram, name: 'Telegram', url: "#" },
    { icon: svg.youtube, name: 'YouTube', url: "#" },
    { icon: svg.docs, name: 'Docs', url: "#" },
]
const openUrl = (url: string) => {
    window.open(url, '_blank');
}

const hoverChat = (id: number) => {
    isHover.value = true;
    hoverId.value = id;
};

const leaveChat = () => {
    isHover.value = false;
    hoverId.value = 0;
};
const deleteChat = async (id: string) => {
    try {
        await deleteUserChat(id);
        storage.getChatList();
    } catch (error) {
        console.log(error);
    };
};
</script>
<style scoped lang="scss">
.logo {
    width: 100%;
    height: 64px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;

    .logo-content {
        display: flex;
        align-items: center;

        .logoExpanded {
            width: 50px;
            height: 50px;
        }

        span {
            font-size: 24px;
            font-weight: bold;
            font-family: 'Courier New', Courier, monospace;
        }
    }

    img {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

}

.chat-title {
    font-size: 14px;
    font-weight: 500;
    padding: 12px 20px;
    box-sizing: border-box;

}

.chat-list {
    width: 100%;
    height: calc(100% - 240px);
    overflow-y: auto;

    .chat-item {
        width: calc(100% - 20px);
        height: 44px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        box-sizing: border-box;
        cursor: pointer;
        border-radius: 8px;
        margin-top: 4px;

        &:hover {
            background-color: var(--chat-item-hover-color);
        }

        span {
            font-size: 14px;
            font-weight: 500;
            margin-left: 10px;
        }

        .more-btn {
            margin-left: auto;
        }

    }
}

.foot {
    border-top: 1px solid var(--menu-foot-border);
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-top: auto;
    box-sizing: border-box;
    padding: 10px 0 20px 0;

    .externallinks {
        width: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;

        .item {
            width: 100%;
            height: 24px;
            display: flex;
            align-items: center;
            cursor: pointer;
            border-radius: 8px;
            margin-top: 4px;
            flex-wrap: nowrap;
            padding: 0 20px;
            box-sizing: border-box;

            &:hover {
                color: #fff;
            }

            span {
                font-size: 12px;
                line-height: 17px;
                font-weight: 600;
                font-family: Manrope, Inter, PingFangSC-Regular, "Microsoft YaHei", sans-serif;
                margin-left: 10px;
                margin-right: auto;
            }
        }
    }
}
</style>
