<template>
    <div class="logo">
        <div class="logo-content" @click="router.push('/')">
            <Logo />
            <span>Eva</span>
        </div>
        <el-icon :size="24" @click="isCollapse = !isCollapse">
            <Fold />
        </el-icon>
    </div>
    <el-menu-item index="/">
        <el-icon>
            <House />
        </el-icon>
        <template #title>
            <span>{{ $at('首页') }}</span>
        </template>
    </el-menu-item>
    <el-menu-item index="/search">
        <el-icon>
            <Search />
        </el-icon>
        <template #title>
            <span>{{ $at('搜索') }}</span>
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
        <div class="foot-item">
            <el-dropdown>
                <div class="lang">
                    {{lang.find(item => item.code === langSet.lang)?.name}}
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-for="item in lang" :key="item.code"
                            @click="setCurrentLang(item.code, item.json)">
                            {{ item.name }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <div class="darkWrap">
                <div :class="!isDark ? 'darkBox' : 'darkBoxS'">
                    <div :class="!isDark ? 'darkItemS' : 'darkItem'" @click="toggle(false)">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" :d="svgIcon.light" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div :class="isDark ? 'darkItemD' : 'darkItem'" @click="toggle(true)">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                            class="MuiBox-root mui-style-19rsff">
                            <path fill-rule="evenodd" clip-rule="evenodd" :d="svgIcon.dark" fill="currentColor"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <el-dropdown>
            <div class="foot-user">
                <el-avatar :size="32">{{ email[0] }}</el-avatar>
                <span>{{ email }}</span>
            </div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="logout">
                        {{ $at('退出登录') }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>
<script setup lang="ts">
import Logo from '@/components/logo.vue'
import svgIcon from "@/utils/svg"
import { $at } from 'i18n-auto-extractor';
import { CloseBold, } from '@element-plus/icons-vue';
import { useDark, useToggle } from '@vueuse/core';
import { useVueAt } from 'i18n-auto-extractor/vue';
import enJSON from '@/locales/en.json';
import zhJSON from '@/locales/zh-CN.json';
import jaJSON from '@/locales/ja.json';
const { setCurrentLang, langSet } = useVueAt();
const lang = [
    { name: '简体中文', code: 'zh-CN', json: zhJSON },
    { name: 'English', code: 'en', json: enJSON },
    { name: '日本語', code: 'ja', json: jaJSON }
];

const isDark = useDark();
const toggle = (bool: boolean) => {
    isDark.value = bool;
    useToggle(bool);
};


const storage = useUserStore();
const { email, chatList, isCollapse, token } = storeToRefs(storage);
const router = useRouter();
const isHover = ref(false);
const hoverId = ref(0);

const logout = async () => {
    try {
        token.value = '';
        router.push('/login');
    } catch (error) {
        console.log(error);
    }
};
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
            font-size: 20px;
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
    padding: 10px 0;

    .foot-item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        box-sizing: border-box;

        .lang {
            padding: 5px 10px;
            border: 1px solid #b4aaaa;
            border-radius: 8px;
            cursor: pointer;
        }
    }

    .foot-user {
        width: 90%;
        margin: 0 auto;
        display: flex;
        align-items: center;
        padding: 5px;
        background: var(--menu-foot-bg);
        border-radius: 8px;
        box-sizing: border-box;
        flex-shrink: 0;
        margin-top: 10px;
        cursor: pointer;

        span {
            font-size: 14px;
            margin-left: 10px;
        }

        .el-avatar {
            flex-shrink: 0;
            border: 1px solid #fff;
        }

    }

    img {
        width: 24px;
        height: 24px;
    }

    .darkWrap {
        display: flex;
        align-items: center;

        .darkBox {
            display: flex;
            align-items: center;
            width: 64px;
            height: 24px;
            background: #f0f0f0;
            border-radius: 8px;
            padding: 2px;
            cursor: pointer;
        }

        .darkBoxS {
            display: flex;
            align-items: center;
            width: 64px;
            height: 24px;
            background: #606060;
            border-radius: 8px;
            padding: 2px;
            cursor: pointer;
        }

        .darkItem {
            width: 50%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border-radius: 8px;
        }

        .darkItemS {
            width: 50%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border-radius: 8px;
            color: rgb(235, 141, 39);
            background: #fff;
        }

        .darkItemD {
            width: 50%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border-radius: 8px;
            color: rgb(235, 141, 39);
            background: rgb(37, 40, 49);
            z-index: 5;
        }
    }

    .el-switch {
        --el-switch-on-color: var(--el-switch-off-color);
    }
}
</style>
