<template>
  <div class="min-h-screen">
    <!-- 二次元漂浮装饰层 -->
    <div class="scene-decor" aria-hidden="true">
      <span class="bubble b1" />
      <span class="bubble b2" />
      <span class="bubble b3" />
      <span class="bubble b4" />
      <span class="bubble b5" />
      <span class="petal p1" />
      <span class="petal p2" />
      <span class="petal p3" />
      <span class="petal p4" />
    </div>

    <div class="blog-layout">
      <header class="blog-header">
        <NuxtLink to="/" class="site-name">
          <span class="logo-emoji">🌸</span>
          <span>我的<b>技术博客</b></span>
        </NuxtLink>
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
        © {{ new Date().getFullYear() }} · Made with 🍑 Nuxt &amp; Tailwind
      </footer>
    </div>
  </div>
</template>