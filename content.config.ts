import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**',
    }),
    // content 集合只匹配根目录下的 md（index.md / about.md），不含 blog/ 目录
    content: defineCollection({
      type: 'page',
      source: '*.md',
    }),
  },
})