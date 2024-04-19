<template>
    <iframe scrolling='no' frameborder='0' src='http://yibo.iyiyun.com/js/yibo404/key/1' width='640' height='462'
        style='display:block;'></iframe>
</template>

<script setup>
import { onMounted } from 'vue'
onMounted(() => {

    // 在组件挂载后加载外部 JavaScript 文件
    const script = document.createElement('script')
    script.src = 'https://www.qq.com/404/search_children.js?edition=small'
    script.async = true
    document.body.appendChild(script)
})
</script>
