<script setup lang="ts">
const { data: about } = await useAsyncData('about-page', () =>
  queryCollection('content').path('/about').first(),
)
useHead({ title: '关于' })
</script>

<template>
  <div>
    <h1 class="page-title">关于本站</h1>
    <div class="markdown-content" style="margin-top: 16px">
      <ContentRenderer v-if="about" :value="about" />
    </div>
  </div>
</template>