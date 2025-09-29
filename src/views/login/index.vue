<template>
    <div class="login">
        <div class="login-bg" v-if="!isMobile"> </div>
        <div class="login-box">
            <div class="login-box-bg" v-if="isMobile"></div>
            <div class="login-box-content">
                <h2>
                    <img src="/image/logo_dark.png" />
                    Eva
                </h2>
                <el-form label-position="top" :model="form" :rules="rules" ref="formRef" label-width="100px">
                    <el-form-item :label="$at('邮箱')" prop="email">
                        <el-input v-model="form.email" :placeholder="$at('请输入邮箱')" />
                    </el-form-item>
                    <el-form-item :label="$at('密码')" prop="password">
                        <el-input v-model="form.password" :placeholder="$at('请输入密码')" type="password" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSubmit">{{ $at('登录') }}</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor'
import type { FormInstance } from 'element-plus'
import { login } from '@/api'
import { eq } from 'lodash';
const { isMobile } = useDevice();
const router = useRouter();
const userStore = useUserStore();
const { token, email } = storeToRefs(userStore);

const form = reactive({
    email: '',
    password: ''
});
const formRef = ref<FormInstance>();

const rules = reactive({
    email: [{ required: true, message: $at('请输入邮箱'), trigger: 'blur' }],
    password: [{ required: true, message: $at('请输入密码'), trigger: 'blur' }]
});
const handleSubmit = async () => {
    await formRef.value?.validate();
    try {
        const res = await login(form)
        if (eq(res?.code, 0)) {
            ElMessage.success('Login success');
            token.value = res.data;
            email.value = form.email;
            localStorage.setItem('token', res.data);
            router.push('/');
        } else {
            ElMessage.error(res.msg);
        };
    } catch (error) {
        console.log(error);
    };
};

</script>
<style scoped lang="scss">
.login {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;

    .login-bg {
        width: 30%;
        height: 100vh;
        background-image: url('https://cdn.talkie-ai.com/public-cdn-s3-us-west-2/talkie-ugc/_next/static/media/bg.03b2ae36.webp');
        background-repeat: repeat-y;
        background-size: 100% auto;
        animation: scroll 30s linear infinite;
    }

    .login-box {
        width: 70%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        @media (max-width: 768px) {
            width: 100%;

        }

        .login-box-bg {
            display: none;

            @media (max-width: 768px) {
                display: block;
                width: 100%;
                height: 100%;
                position: absolute;
                left: 0;
                top: 0;
                background-image: url('https://cdn.talkie-ai.com/public-cdn-s3-us-west-2/talkie-ugc/_next/static/media/bg.03b2ae36.webp');
                background-repeat: repeat-y;
                /* 垂直重复 */
                background-size: 100% auto;
                /* 宽度 100%，高度 auto 保持原比例 */
                animation: scroll 30s linear infinite;
                filter: blur(8px);

            }

        }

        .login-box-content {
            text-align: center;
            filter: blur(0);
            max-width: 400px;
            width: 100%;
            background: rgba($color: #000000, $alpha: .8);
            border-radius: 20px;
            padding: 20px;

            @media (max-width: 768px) {

                width: 80%;
            }

            h2 {
                display: flex;
                justify-content: center;
                align-items: center;
                color: var(--title);

                img {
                    width: 50px;
                    height: 50px;

                }
            }

        }

    }
}

@keyframes scroll {
    0% {
        background-position: 0 0;
    }

    100% {
        background-position: 0 200vh;
    }
}

.el-form {
    width: 100%;

    .el-button {
        width: 100%;
    }
}
</style>
