/** 全局命令面板开关（⌘K / Ctrl+K 触发） */
const isOpen = ref(false)

export function useCommandPalette() {
  function open() {
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
  }
  function toggle() {
    isOpen.value = !isOpen.value
  }
  return { isOpen, open, close, toggle }
}
