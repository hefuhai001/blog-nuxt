<script setup lang="ts">
import { usePostStats } from '~/composables/stats'

const props = defineProps<{ postId: string }>()
const { stats, trackView, toggleLike } = usePostStats(props.postId)

onMounted(() => trackView())
</script>

<template>
  <div class="article-stats">
    <span class="stat-item" title="本机浏览计数（localStorage）">
      <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span class="stat-num">{{ stats.views }}</span>
      <span class="stat-label">阅读</span>
    </span>
    <button class="stat-item stat-like" :class="{ liked: stats.liked }" title="点赞" @click="toggleLike">
      <svg class="stat-icon" viewBox="0 0 24 24" :fill="stats.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span class="stat-num">{{ stats.likes }}</span>
      <span class="stat-label">点赞</span>
    </button>
  </div>
</template>

<style scoped>
.article-stats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 18px;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg-weak);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-like {
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), color 0.2s ease,
    background-color 0.2s ease;
}

.stat-like:hover {
  color: var(--ios-red);
  transform: translateY(-1px);
}

.stat-like:active {
  transform: scale(0.94);
}

.stat-like.liked {
  background: rgba(255, 59, 48, 0.14);
  border-color: rgba(255, 59, 48, 0.35);
  color: var(--ios-red);
  font-weight: 600;
}

.stat-icon {
  width: 15px;
  height: 15px;
}

.stat-num {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
}

.stat-like.liked .stat-num {
  color: var(--ios-red);
}
</style>
