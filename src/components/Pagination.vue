<template>
    <div class="pagination">
        <el-pagination v-model:current-page="page_index" v-model:page-size="page_size"
            :page-sizes="[100, 200, 300, 400]" layout="total, sizes, prev, pager, next" :total="total"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>


</template>
<script setup lang="ts">
const page_index = defineModel<number>("page", {
    default: 1
})
const page_size = defineModel<number>("size", {
    default: 10
})
const total = defineModel<number>("total", {
    default: 0
})
const handleSizeChange = (val: number) => {
    page_size.value = val
}
const handleCurrentChange = (val: number) => {
    page_index.value = val
}
</script>
<style scoped lang="scss">
.pagination {
    width: 100%;
    margin-top: auto;
    display: flex;
    justify-content: end;
}
</style>