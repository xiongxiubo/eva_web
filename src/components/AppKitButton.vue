<template>
    <button class="btn" @click="openAppKit">
        <div class="btn-img">
            <img src="/image/wc.jpeg" alt="">
            <img src="/image/Fox.png" alt="">
            <img src="/image/bnb.png" alt="">
            <img src="/image/okx.png" alt="">
        </div>

        Connect Wallet
    </button>
</template>
<script setup lang="ts">
import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/vue";
import { BrowserProvider } from "ethers";
import { eq } from "lodash";

const { token } = storeToRefs(useUserStore());
const { open } = useAppKit();
const Account = useAppKitAccount();
const Provider = useAppKitProvider("eip155");
const router = useRouter();
const signature = ref("");
const msg = ref("");

const openAppKit = () => {
    open({ view: "Connect", namespace: "eip155" });
}
watch(() => Account.value.isConnected, async () => {
    connect();
});
//连接钱包
async function connect() {
    if (!Account.value.isConnected) return;
    await signMessage();
    web3login();
};
async function signMessage() {
    if (!Account.value.isConnected) {
        ElMessage.warning("未连接钱包");
        return;
    };
    const provider = new BrowserProvider(Provider.walletProvider as any);
    const signer = await provider.getSigner();

    const message = `Hello`;
    const signa = await signer.signMessage(message);
    signature.value = signa;
    msg.value = message;
};
const web3login = async () => {
    if (!Account.value.isConnected) return;
    if (!signature.value || !msg.value || !Account.value.address) return;
    const res = await loginWeb3({ signature: signature.value, msg: msg.value, address: Account.value.address });
    if (eq(res?.code, 0)) {
        ElMessage.success('Login success');
        token.value = res.data;
        localStorage.setItem('token', res.data);
        router.push('/');
    } else {
        ElMessage.error(res.msg);
    };
};


</script>
<style scoped lang="scss">
.btn {
    width: 100%;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    height: 56px;
    background: #33363f;
    color: #fff;
    font-size: 17px;
    font-weight: 500;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: bold;
    line-height: 24px;
}

.btn-img {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-wrap: wrap;
    gap: 2px;
    background: #41454f;
    border-radius: 8px;
    margin-right: 15px;


    img {
        width: 14px;
        height: 14px;
        border-radius: 10px;

    }
}
</style>