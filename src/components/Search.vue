<template>
    <div class="search-container">
        <div class="search-input">
            <el-icon :size="20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    class="search-icon MuiBox-root mui-style-1kyyacg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M14.71 14H15.5L20.49 19L19 20.49L14 15.5V14.71L13.73 14.43C12.59 15.41 11.11 16 9.5 16C5.91 16 3 13.09 3 9.5C3 5.91 5.91 3 9.5 3C13.09 3 16 5.91 16 9.5C16 11.11 15.41 12.59 14.43 13.73L14.71 14ZM5 9.5C5 11.99 7.01 14 9.5 14C11.99 14 14 11.99 14 9.5C14 7.01 11.99 5 9.5 5C7.01 5 5 7.01 5 9.5Z"
                        fill="currentColor"></path>
                </svg>
            </el-icon>
            <input type="text" v-model="inputValue" :placeholder="$at('请输入搜索内容')" @focus="visible = true"
                @blur="visible = false">

        </div>
        <div class="search" v-show="visible">

        </div>
    </div>

</template>
<script setup lang="ts">
import { $at } from 'i18n-auto-extractor';

const visible = ref(false);
const inputValue = ref('');
</script>
<style scoped lang="scss">
.search-container {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 2000;
    background: var(--el-menu-active-bg-color);
    border-radius: 4px;
    margin-left: 20px;

    .search-input {
        display: flex;
        align-items: center;
        position: relative;
        // border-bottom: 1px solid #454851;

        .el-icon {
            position: absolute;
            left: 10px;
        }

        input {
            width: 300px;
            border: 0;
            font-size: 14px;
            line-height: 19px;
            font-weight: 500;
            font-family: Manrope, Inter, PingFangSC-Regular, "Microsoft YaHei", sans-serif;
            padding: 5px 10px;
            padding-left: 35px;
            background-color: transparent;

            &:focus {
                outline: none;
                box-shadow: none;
                border-color: transparent;
            }
        }
    }


}

.search {
    background: var(--el-header-bg-color);
}
</style>
