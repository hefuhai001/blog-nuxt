<script setup lang="ts">
import { useAsyncData } from 'nuxt/app'
const { data: about } = await useAsyncData('about-page', () =>
  queryCollection('content').path('/about').first(),
)
useHead({ title: '关于' })
</script>

<template>
  <div>
    <h1 class="page-title">关于本站</h1>
    <div class="card">
      <div class="markdown-content">
        <ContentRenderer v-if="about" :value="about" />
      </div>
    </div>
  </div>
</template>