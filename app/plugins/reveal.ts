// v-reveal：进入视口时添加 .is-visible 触发渐入动画
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  function getObserver() {
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer?.unobserve(entry.target)
            }
          }
        },
        { threshold: 0.12 },
      )
    }
    return observer
  }

  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement, binding) {
      el.classList.add('reveal')
      if (binding.value?.delay) {
        ;(el.style as CSSStyleDeclaration).transitionDelay = `${binding.value.delay}ms`
      }
      getObserver().observe(el)
    },
    getSSRProps() {
      return {}
    },
  })
})
