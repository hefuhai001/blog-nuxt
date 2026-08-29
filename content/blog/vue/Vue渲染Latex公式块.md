# Vue `MathJax`  `KaTeX` 渲染  LaTeX 公式块

### 1. 使用 `MathJax` 渲染 LaTeX 公式

#### 安装依赖
```bash
npm install mathjax
```

#### 配置 MathJax
在 `public/index.html` 中引入 MathJax 的 CDN 链接并进行配置：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue LaTeX Project</title>
  <script>
    MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
      },
      svg: { fontCache: 'global' }
    };
  </script>
  <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

#### 创建 Vue 组件
创建一个 `MarkdownRenderer.vue` 组件，用于渲染 Markdown 内容并支持 LaTeX 公式：
```vue
<template>
  <div v-html="renderedContent"></div>
</template>

<script>
export default {
  props: {
    content: String
  },
  computed: {
    renderedContent() {
      // 使用 MathJax 自动解析 LaTeX 公式
      return this.content;
    }
  },
  mounted() {
    // 确保 MathJax 渲染公式
    MathJax.typesetPromise([this.$el]);
  },
  watch: {
    content() {
      // 当内容更新时重新渲染公式
      MathJax.typesetPromise([this.$el]);
    }
  }
};
</script>
```

#### 使用组件
在父组件中使用 `MarkdownRenderer` 组件：
```vue
<template>
  <div>
    <markdown-renderer :content="markdownContent" />
  </div>
</template>

<script>
import MarkdownRenderer from './components/MarkdownRenderer.vue';

export default {
  components: {
    MarkdownRenderer
  },
  data() {
    return {
      markdownContent: `
# Markdown with LaTeX Formulas

$$
\\begin{align*}
e^x & = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\frac{x^4}{4!} + \\cdots \\\\
    & = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}
\\end{align*}
$$

\\[ \\text{均值} (\\bar{x}) = \\frac{1}{N}\\sum_{i=1}^{N} x_i \\]
      `
    };
  }
};
</script>
```

### 2. 使用 `KaTeX` 渲染 LaTeX 公式

#### 安装依赖
```bash
npm install katex
```

#### 创建 KaTeX 组件
创建一个 `KatexRenderer.vue` 组件，用于渲染 LaTeX 公式：
```vue
<template>
  <div v-html="renderedFormula"></div>
</template>

<script>
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default {
  props: {
    formula: String
  },
  computed: {
    renderedFormula() {
      return katex.renderToString(this.formula, { throwOnError: false });
    }
  }
};
</script>
```

#### 使用组件
在父组件中使用 `KatexRenderer` 组件：
```vue
<template>
  <div>
    <katex-renderer :formula="formula" />
  </div>
</template>

<script>
import KatexRenderer from './components/KatexRenderer.vue';

export default {
  components: {
    KatexRenderer
  },
  data() {
    return {
      formula: `
\\begin{align*}
e^x & = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\frac{x^4}{4!} + \\cdots \\\\
    & = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}
\\end{align*}
`
    };
  }
};
</script>
```

### 3. 结合 Markdown 渲染
如果你需要结合 Markdown 渲染并支持 LaTeX 公式，可以使用 `markdown-it` 和 `markdown-it-katex`。

#### 安装依赖
```bash
npm install markdown-it markdown-it-katex
```

#### 创建 Markdown 组件
创建一个 `MarkdownRenderer.vue` 组件：
```vue
<template>
  <div v-html="renderedMarkdown"></div>
</template>

<script>
import MarkdownIt from 'markdown-it';
import katex from 'markdown-it-katex';

export default {
  props: {
    content: String
  },
  computed: {
    renderedMarkdown() {
      const md = new MarkdownIt();
      md.use(katex);
      return md.render(this.content);
    }
  }
};
</script>
```

#### 使用组件
在父组件中使用 `MarkdownRenderer` 组件：
```vue
<template>
  <div>
    <markdown-renderer :content="markdownContent" />
  </div>
</template>

<script>
import MarkdownRenderer from './components/MarkdownRenderer.vue';

export default {
  components: {
    MarkdownRenderer
  },
  data() {
    return {
      markdownContent: `
# Markdown with LaTeX Formulas

$$
\\begin{align*}
e^x & = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\frac{x^4}{4!} + \\cdots \\\\
    & = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}
\\end{align*}
$$

\\[ \\text{均值} (\\bar{x}) = \\frac{1}{N}\\sum_{i=1}^{N} x_i \\]
      `
    };
  }
};
</script>
```
