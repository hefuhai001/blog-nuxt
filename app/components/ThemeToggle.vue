<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="isDark ? '切换到白天模式' : '切换到黑夜模式'"
    :title="isDark ? '切换到白天模式' : '切换到黑夜模式'"
    @click="toggle"
  >
    <span class="theme-icon">{{ isDark ? '🌙' : '☀️' }}</span>
  </button>
</template>