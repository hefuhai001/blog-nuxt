<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button
    class="icon-btn"
    :aria-label="isDark ? '切换到白天模式' : '切换到黑夜模式'"
    :title="isDark ? '切换到白天模式' : '切换到黑夜模式'"
    @click="toggle"
  >
    <Sun v-if="isDark" class="size-4" aria-hidden="true" />
    <Moon v-else class="size-4" aria-hidden="true" />
  </button>
</template>
