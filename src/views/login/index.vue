<template>
    <div class="login">
        <div class="login-box">
            <div class="login-box-content" v-show="!showRegister">
                <h2>
                    <img src="/image/logo_dark.png" />
                    Log in to your account
                </h2>
                <el-form label-position="top" :model="form" :rules="rules" ref="formRef" label-width="100px">
                    <FormItem prop="email" label="Email" placeholder="Enter your email" v-model="form.email"
                        type="email" />
                    <FormItem prop="password" label="Password" placeholder="Enter your password" v-model="form.password"
                        type="password" />
                    <el-form-item>
                        <el-button color="#2D68FF" @click="handleSubmit">Log in</el-button>
                    </el-form-item>
                </el-form>
                <AppKitButton />
                <p>Don't have an account? <el-link type="primary" @click="showRegister = true">Register</el-link></p>
            </div>
            <div class="login-box-content" v-show="showRegister">
                <h2>
                    <img src="/image/logo_dark.png" />
                    Register your account
                </h2>
                <el-form label-position="top" :model="form" :rules="registerRules" ref="registerFormRef"
                    label-width="100px">
                    <FormItem prop="username" label="Username" :min="3" :max="30" placeholder="Enter your username"
                        v-model="form.username" />
                    <FormItem prop="email" label="Email" placeholder="Enter your email" v-model="form.email"
                        type="email" />
                    <FormItem prop="password" label="Password" placeholder="Enter your password" v-model="form.password"
                        type="password" />
                    <FormItem prop="password_confirm" label="Confirm Password" placeholder="Confirm your password"
                        v-model="form.password_confirm" type="password" />
                    <el-form-item>
                        <el-button color="#2D68FF" @click="handleRegisterSubmit">Register</el-button>
                    </el-form-item>
                </el-form>
                <el-divider>Or</el-divider>
                <p>Already have an account? <el-link type="primary" @click="showRegister = false">Log in</el-link></p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor'
import type { FormInstance, FormRules } from 'element-plus'
import { eq } from 'lodash';

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
const registerRules = reactive<FormRules>({
    username: [
        { required: true, message: $at('请输入用户名'), trigger: 'blur' },
        { min: 3, max: 30, message: $at('用户名长度必须在 3 到 30 个字符之间'), trigger: 'blur' }
    ],
    email: [
        { required: true, message: $at('请输入邮箱'), trigger: 'blur' },
        { type: 'email', message: $at('请输入正确的邮箱格式'), trigger: 'blur' }
    ],
    password: [
        { required: true, message: $at('请输入密码'), trigger: 'blur' },
        { min: 6, max: 40, message: $at('密码长度必须在 6 到 40 个字符之间'), trigger: 'blur' }
    ],
    password_confirm: [
        { required: true, message: $at('请输入确认密码'), trigger: 'blur' },
        {
            validator: (rule: any, value: any, callback: (error?: string | Error) => void) => {
                if (value !== form.password) {
                    callback($at('两次输入密码不一致'));
                } else {
                    callback();
                }
            }, trigger: 'blur'
        }
    ]
});

const rules = reactive<FormRules>({
    email: [
        { required: true, message: $at('请输入邮箱'), trigger: 'blur' },
        { type: 'email', message: $at('请输入正确的邮箱格式'), trigger: 'blur' }
    ],
    password: [
        { required: true, message: $at('请输入密码'), trigger: 'blur' },
        { min: 6, max: 40, message: $at('密码长度必须在 6 到 40 个字符之间'), trigger: 'blur' }
    ]
});


const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (!valid) return;
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
    const valid = await registerFormRef.value?.validate();
    if (!valid) return;
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
</script>
<style scoped lang="scss">
.login {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url("/image/login.jpg");
    background-repeat: no-repeat;
    background-size: cover;

    .login-box {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .login-box-content {
            text-align: center;
            filter: blur(0);
            max-width: 400px;
            width: 100%;
            border-radius: 20px;
            padding: 20px;

            @media (max-width: 768px) {

                width: 80%;
            }

            h2 {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: var(--title);
                margin-bottom: 30px;

                img {
                    width: 50px;
                    height: 50px;
                    margin-bottom: 10px;

                }
            }

            p {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 30px;
            }

        }

    }
}

.el-form {
    width: 100%;

    .el-input {
        height: 56px;
    }

    .el-button {
        width: 100%;
        height: 56px;
        font-size: 17px;
        font-weight: bold;
        line-height: 24px;
        border-radius: 8px;

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
