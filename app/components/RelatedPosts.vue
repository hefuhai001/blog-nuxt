<script setup lang="ts">
import { articleTitle, articleHref } from '~/composables/blog'

defineProps<{
  items: any[]
  category: string
}>()
</script>

<template>
  <section class="related-posts">
    <h2 class="related-title">相关推荐</h2>
    <ul class="related-list">
      <li v-for="post in items" :key="post.id">
        <NuxtLink :to="articleHref(post)" class="related-link">
          {{ articleTitle(post) }}
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.related-posts {
  margin-top: 32px;
  padding-top: 22px;
  border-top: 1px solid var(--glass-divider);
}

.related-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 0 0 12px;
  letter-spacing: 0.02em;
}

.related-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
}

.related-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg-weak);
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--text-primary);
  transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease,
    color 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-link::before {
  content: "›";
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ios-blue);
}

.related-link:hover {
  background: var(--glass-bg-strong);
  color: var(--ios-blue);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass);
}

@media (max-width: 560px) {
  .related-list {
    grid-template-columns: 1fr;
  }
}
</style>
