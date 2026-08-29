<script setup lang="ts">
</script>

<template>
  <div class="blog-layout">
    <header class="blog-header">
      <NuxtLink to="/" class="site-name">我的<em>技术博客</em></NuxtLink>
      <nav>
        <NuxtLink to="/">首页</NuxtLink>
        <NuxtLink to="/about">关于</NuxtLink>
      </nav>
    </header>

    <div class="blog-body">
      <main class="blog-main">
        <slot />
      </main>
      <BlogSidebar />
    </div>

    <footer class="blog-footer">
      © {{ new Date().getFullYear() }} · Built with Nuxt &amp; @nuxt/content
    </footer>
  </div>
</template>