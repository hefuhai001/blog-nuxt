<template>
  <div class="min-h-screen">
    <!-- iOS 26 背景光斑层（供玻璃模糊） -->
    <div class="ios-backdrop" aria-hidden="true" />

    <div class="blog-layout">
      <header class="blog-header">
        <NuxtLink to="/" class="site-name">
          <span class="logo-emoji">🌸</span>
          <span>我的<b>技术博客</b></span>
        </NuxtLink>
        <nav class="nav-capsule">
          <NuxtLink to="/" class="nav-link">首页</NuxtLink>
          <NuxtLink to="/about" class="nav-link">关于</NuxtLink>
          <ThemeToggle />
        </nav>
      </header>

      <div class="blog-body">
        <main class="blog-main">
          <slot />
        </main>
        <BlogSidebar />
      </div>

      <footer class="blog-footer">
        © {{ new Date().getFullYear() }} · Made with 🍑 Nuxt &amp; Tailwind
      </footer>
    </div>
  </div>
</template>
