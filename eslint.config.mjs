// ESLint 扁平配置（基础规则由 @nuxt/eslint 模块生成）
// @see https://eslint.nuxt.com
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // 本站组件按功能命名（Alert / Counter / Giscus 等），不强制多词命名
    'vue/multi-word-component-names': 'off',
  },
})
