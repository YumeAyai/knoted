import { ref, shallowRef, watch, onUnmounted, type Ref } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { useAppStore, type EditorMode } from '@/stores/app'

interface UseEditorOptions {
  mode?: EditorMode
  placeholder?: string
  onChange?: (value: string) => void
}

export function useEditor(
  container: Ref<HTMLElement | null>,
  options: UseEditorOptions = {}
) {
  const store = useAppStore()
  const vditor = shallowRef<Vditor | null>(null)
  const content = ref('')
  const wordCount = ref(0)
  const charCount = ref(0)

  const updateStats = (value?: string) => {
    const contentValue = value ?? getValue()
    const words = contentValue.trim().split(/\s+/).filter(w => w.length > 0)
    wordCount.value = words.length
    charCount.value = contentValue.length
    store.setEditorStats(wordCount.value, charCount.value)
  }

  const initEditor = (initialValue = '', mode: EditorMode = 'wysiwyg') => {
    if (!container.value) return

    if (vditor.value) {
      vditor.value.destroy()
      vditor.value = null
    }

    vditor.value = new Vditor(container.value, {
      value: initialValue,
      mode: mode,
      placeholder: options.placeholder || 'Start writing...',
      cache: {
        enable: false
      },
      toolbarConfig: {
        pin: true,
      },
      input: (value) => {
        content.value = value
        updateStats(value)
        options.onChange?.(value)
      },
      blur: (value) => {
        content.value = value
      },
    })

    content.value = initialValue
    updateStats(initialValue)
  }

  const setValue = (value: string) => {
    if (vditor.value) {
      vditor.value.setValue(value)
      content.value = value
      updateStats(value)
    }
  }

  const getValue = () => {
    return vditor.value?.getValue() || content.value
  }

  const setTheme = (theme: 'light' | 'dark') => {
    if (vditor.value) {
      vditor.value.setTheme(theme === 'dark' ? 'dark' : 'classic')
    }
  }

  const setMode = (mode: EditorMode) => {
    if (!vditor.value) return
    const currentValue = getValue()
    initEditor(currentValue, mode)
  }

  const focus = () => {
    vditor.value?.focus()
  }

  const destroy = () => {
    if (vditor.value) {
      vditor.value.destroy()
      vditor.value = null
    }
  }

  watch(() => store.editorMode, (newMode) => {
    if (vditor.value) {
      setMode(newMode)
    }
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    vditor,
    content,
    wordCount,
    charCount,
    initEditor,
    setValue,
    getValue,
    setTheme,
    setMode,
    focus,
    destroy,
  }
}