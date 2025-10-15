<template>
    <div class="login">
        <div class="login-bg" v-if="!isMobile"> </div>
        <div class="login-box">
            <div class="login-box-bg" v-if="isMobile"></div>
            <div class="login-box-content" v-show="!showRegister">
                <h2>
                    <img src="/image/logo_dark.png" />
                    登录
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
                <el-divider>{{ $at('或者') }}</el-divider>
                <div class="apkbtn">
                    <appkit-connect-button class="btn" />
                </div>
                <p>还没有账号？<el-link type="primary" @click="showRegister = true">{{ $at('注册') }}</el-link></p>
            </div>
            <div class="login-box-content" v-show="showRegister">
                <h2>
                    <img src="/image/logo_dark.png" />
                    注册
                </h2>
                <el-form label-position="top" :model="form" :rules="registerRules" ref="registerFormRef"
                    label-width="100px">
                    <el-form-item :label="$at('用户名')" prop="username">
                        <el-input v-model="form.username" :placeholder="$at('请输入用户名')" />
                    </el-form-item>
                    <el-form-item :label="$at('邮箱')" prop="email">
                        <el-input v-model="form.email" :placeholder="$at('请输入邮箱')" />
                    </el-form-item>
                    <el-form-item :label="$at('密码')" prop="password">
                        <el-input v-model="form.password" :placeholder="$at('请输入密码')" type="password" />
                    </el-form-item>
                    <el-form-item :label="$at('确认密码')" prop="password_confirm">
                        <el-input v-model="form.password_confirm" :placeholder="$at('请输入确认密码')" type="password" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleRegisterSubmit">{{ $at('注册') }}</el-button>
                    </el-form-item>
                </el-form>
                <el-divider>{{ $at('或者') }}</el-divider>
                <p>{{ $at('已有账号？') }} <el-link type="primary" @click="showRegister = false">{{ $at('登录') }}</el-link>
                </p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor'
import type { FormInstance } from 'element-plus'
import { eq } from 'lodash';
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/vue";
import { BrowserProvider } from "ethers";

const accountData = useAppKitAccount();
const Provider = useAppKitProvider("eip155");
const signature = ref("");
const msg = ref("");

const { isMobile } = useDevice();
const router = useRouter();
const userStore = useUserStore();
const { token } = storeToRefs(userStore);
const showRegister = ref(false);

const form = reactive({
    email: '',
    password: '',
    username: '',
    password_confirm: ''
});
const formRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();
// 注册时的校验规则
const registerRules = reactive({
    username: [{ required: true, message: $at('请输入用户名'), trigger: 'blur' }],
    email: [{ required: true, message: $at('请输入邮箱'), trigger: 'blur' }],
    password: [{ required: true, message: $at('请输入密码'), trigger: 'blur' }],
    password_confirm: [{ required: true, message: $at('请输入确认密码'), trigger: 'blur' }]
});

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
            localStorage.setItem('token', res.data);
            router.push('/');
        } else {
            ElMessage.error(res.msg);
        };
    } catch (error) {
        console.log(error);
    };
};
// 注册提交
const handleRegisterSubmit = async () => {
    await registerFormRef.value?.validate();
    try {
        const res = await register(form)

        if (eq(res?.code, 0)) {
            ElMessage.success('Register success');
            token.value = res.data;
            localStorage.setItem('token', res.data);
            router.push('/');
        } else {
            ElMessage.error(res.msg);
        };
    } catch (error) {
        console.log(error);
    };
};

async function signMessage() {
    if (!accountData.value.isConnected) {
        ElMessage.warning("未连接钱包");
        return;
    };
    const provider = new BrowserProvider(Provider.walletProvider as any);
    const signer = await provider.getSigner();

    const message = `Hello`;
    const signa = await signer.signMessage(message);
    signature.value = signa;
    msg.value = message;
}
watch(() => accountData.value.isConnected, async () => {
    connect();
})
//连接钱包
async function connect() {
    if (!accountData.value.isConnected) return;
    await signMessage();
    web3login();
}
const web3login = async () => {
    if (!accountData.value.isConnected) return;
    if (!signature.value || !msg.value || !accountData.value.address) return;
    const res = await loginWeb3({ signature: signature.value, msg: msg.value, address: accountData.value.address });
    console.log(res);
    if (eq(res?.code, 0)) {
        ElMessage.success('Login success');
        token.value = res.data;
        localStorage.setItem('token', res.data);
        router.push('/');
    } else {
        ElMessage.error(res.msg);
    };
}
let observer: any;
onMounted(() => {
    observer = new MutationObserver(() => {
        const appkit = document.querySelector('appkit-connect-button')
        const shadowRoot1 = appkit?.shadowRoot
        const wuiButton = shadowRoot1?.querySelector('wui-connect-button')
        const shadowRoot2 = wuiButton?.shadowRoot
        const button = shadowRoot2?.querySelector('button')

        if (button) {
            // 注入你想要的样式
            button.style.display = "block"
            button.style.width = "100%"
            button.textContent = $at('连接钱包')
            observer.disconnect() // 找到并修改后，停止观察
        }
    })
    // 开始监听整个文档
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    })
})
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

            p {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 5px;
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

.apkbtn {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .btn {
        width: 100%;
    }
}
</style>
