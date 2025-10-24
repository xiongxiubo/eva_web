<template>
    <div class="box" @click="handleClose">
        <div class="content" @click.stop>
            <!-- 左侧菜单 -->
            <div class="body_l">
                <el-menu :default-active="'1'" @select="handleMenuSelect" background-color="transparent"
                    text-color="#a1a1aa" active-text-color="#ffffff" class="custom-menu">
                    <el-menu-item index="1" class="custom-menu-item active">
                        {{ $at('公开个人资料') }}
                    </el-menu-item>
                </el-menu>

                <div class="bottom-buttons">
                    <el-button type="primary" class="community-btn">
                        <span class="icon">+</span>
                        {{ $at('加入社区') }}
                    </el-button>
                </div>
            </div>

            <!-- 右侧内容 -->
            <div class="body_r">
                <div class="header">
                    <h2>{{ $at('公开个人资料') }}</h2>
                    <el-button class="close-btn" @click="handleClose" circle>
                        ×
                    </el-button>
                </div>

                <div class="profile-content">
                    <!-- 头像 -->
                    <div class="avatar-section">
                        <el-avatar
                            :src="user.Address === '' ? generateAvatar(user.Email) : generateAvatar(user.Address)"
                            :size="80" />
                    </div>

                    <!-- 表单 -->
                    <div class="form-section">
                        <div class="form-item">
                            <label>{{ $at('用户名') }}</label>
                            <el-input v-model="username" minlength="3" :maxlength="30" show-word-limit />
                        </div>

                        <div class="form-item">
                            <label>{{ label }}</label>
                            <el-input v-model="address" disabled />
                        </div>

                        <div class="form-item">
                            <label>{{ $at('推特用户名') }}</label>
                            <el-input v-model="twitter_username" :maxlength="100" show-word-limit />
                        </div>
                    </div>

                    <!-- 保存按钮 -->
                    <div class="save-button-container">
                        <el-button type="primary" class="save-button" @click="handleSave">
                            {{ $at('保存个人信息') }}
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { $at } from 'i18n-auto-extractor';
import { generateAvatar } from "@/utils/utils";
import { useUserStore } from "@/stores/user";
import { eq } from 'lodash';

const { user } = storeToRefs(useUserStore());
console.log(user.value);

const defaultValue = defineModel({ default: false })
const label = computed(() => {
    return user.value.Address === '' ? $at('邮箱') : $at('钱包地址')
})
const address = computed(() => {
    return user.value.Address === '' ? user.value.Email : user.value.Address
})
// 响应式数据
const username = ref(user.value.username);
const twitter_username = ref(user.value.twitter);

// 关闭模态框的方法
const handleClose = () => {
    defaultValue.value = false;
};

// 菜单选择事件处理
const handleMenuSelect = (key: string) => {
    console.log('选择了菜单:', key);
    // 这里可以添加菜单切换逻辑
};

// 保存个人信息的方法
const handleSave = () => {
    ElMessageBox.confirm($at('确认保存吗？'), $at('提示'), {
        confirmButtonText: $at('确定'),
        cancelButtonText: $at('取消'),
        type: 'warning'
    }).then(async () => {
        // 确认保存
        const res = await updateUserInfo({
            username: username.value,
            twitter_username: twitter_username.value
        })
        if (eq(res.code, 0)) {
            ElMessage.success($at('保存成功'));
        } else {
            ElMessage.error(res.msg);
        }
    }).catch(() => {
        // 取消保存
    });
};
</script>
<style scoped lang="scss">
.box {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba($color: #000000, $alpha: .6);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    .content {
        width: 800px;
        height: 600px;
        background: #18181b;
        border-radius: 20px;
        display: flex;
        overflow: hidden;

        // 左侧菜单样式
        .body_l {
            width: 200px;
            background: #1a1a1e;
            display: flex;
            flex-direction: column;
            padding: 20px 0;
            border-right: 1px solid #2d2d30;

            .custom-menu {
                width: 100%;
                background: transparent;
                border-right: none;
            }

            .custom-menu-item {
                padding: 12px 20px;
                margin: 0;
                height: auto;
                line-height: normal;
                font-size: 14px;
                color: #a1a1aa;
                transition: all 0.2s ease;
                position: relative;

                &:hover {
                    background: #2d2d30;
                    color: #ffffff;
                }

                &.active {
                    background: #2d2d30;
                    color: #ffffff;

                    &::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 3px;
                        height: 20px;
                        background: #7c3aed;
                        border-radius: 0 4px 4px 0;
                    }
                }
            }

            :deep(.el-menu--horizontal) {
                border-bottom: none;
            }

            :deep(.el-menu--vertical) {
                border-right: none;
            }

            .bottom-buttons {
                margin-top: auto;
                padding: 0 20px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 12px;

                .el-button {
                    width: 100%;
                    padding: 10px;
                    border-radius: 8px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    margin-left: 0;

                    .icon {
                        font-size: 16px;
                    }
                }

                :deep(.community-btn) {
                    background: #7c3aed;
                    border-color: #7c3aed;
                    color: white;

                    &:hover {
                        background: #6d28d9;
                        border-color: #6d28d9;
                    }
                }
            }
        }

        // 右侧内容样式
        .body_r {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #18181b;

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #2d2d30;

                h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                }

                :deep(.close-btn) {
                    background: none !important;
                    border: none !important;
                    color: #a1a1aa !important;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;

                    &:hover {
                        color: #ffffff !important;
                        background: #2d2d30 !important;
                        border-radius: 4px;
                    }
                }
            }

            .profile-content {
                flex: 1;
                padding: 30px;
                display: flex;
                flex-direction: column;

                .avatar-section {
                    display: flex;
                    // justify-content: center;
                    margin-bottom: 30px;
                }

                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .save-button-container {
                    margin-top: 30px;
                    display: flex;
                    justify-content: flex-end;

                    .save-button {
                        background: #7c3aed;
                        border-color: #7c3aed;
                        padding: 20px 24px;
                        font-size: 14px;
                        border-radius: 8px;

                        &:hover {
                            background: #6d28d9;
                            border-color: #6d28d9;
                        }
                    }
                }

                .form-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    background-color: #303136;

                    border: 1px solid #3f3f46;
                    border-radius: 20px;
                    padding: 12px;

                    &:focus-within {
                        label {
                            color: #ffffff;
                        }
                    }

                    label {
                        font-size: 14px;
                        font-weight: 600;
                        color: #a2a2ac;

                    }

                    :deep(.el-input__wrapper) {
                        background: transparent !important;
                        border: 1px solid transparent;
                        box-shadow: none !important;
                        padding: 0;

                        &:hover {
                            border-color: transparent;
                        }
                    }

                    :deep(.el-input__inner) {
                        background: transparent !important;
                        border: 1px solid transparent;
                        color: #ffffff !important;
                        font-size: 14px;
                        transition: all 0.2s ease;
                    }

                    :deep(.el-input__count) {
                        font-size: 12px;
                        color: #71717a;

                        .el-input__count-inner {
                            background: transparent;
                        }
                    }
                }
            }
        }
    }
}


// 响应式设计
@media (max-width: 900px) {
    .box .content {
        width: 90vw;
        height: 90vh;
        flex-direction: column;

        .body_l {
            width: 100%;
            flex-direction: row;
            padding: 10px 0;
            overflow-x: auto;
            border-right: none;
            border-bottom: 1px solid #2d2d30;

            .menu-item {
                white-space: nowrap;
                min-width: fit-content;
            }

            .bottom-buttons {
                display: none;
            }
        }

        .body_r .profile-content {
            padding: 20px;
        }
    }
}
</style>
