<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useEditor } from '@/composables/useEditor'
import { useDatabase } from '@/composables/useDatabase'

const store = useAppStore()
const editorContainer = ref<HTMLElement | null>(null)
const { initEditor, setValue, setTheme, destroy } = useEditor(editorContainer, {
  mode: 'wysiwyg',
  placeholder: 'Start writing...',
  onChange: (value) => {
    handleContentChange(value)
  }
})

const database = useDatabase()

let saveTimer: ReturnType<typeof setTimeout> | null = null

const handleContentChange = (value: string) => {
  if (!store.currentFileId) return

  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (store.storageMode === 'sqlite' && store.currentFileId) {
      database.updateNote(store.currentFileId, { content: value })
    }
  }, 1000)
}

watch(() => store.currentFileId, (newId, oldId) => {
  if (newId) {
    if (store.storageMode === 'sqlite') {
      const note = database.getNoteById(newId)
      if (note) {
        if (!oldId) {
          initEditor(note.content, store.editorMode)
        } else {
          setValue(note.content)
        }
      } else if (!oldId) {
        initEditor('', store.editorMode)
      }
    } else if (!oldId) {
      initEditor('', store.editorMode)
    }
  }
})

watch(() => store.theme, (newTheme) => {
  setTheme(newTheme)
})

onMounted(() => {
  if (store.currentFileId) {
    initEditor('', store.editorMode)
  }
})
</script>

<template>
  <div class="editor-wrapper">
    <div v-if="!store.currentFileId" class="editor-placeholder">
      <div class="placeholder-content">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p>Select a file or create a new one to start writing</p>
      </div>
    </div>
    <div ref="editorContainer" class="editor-container" :class="{ hidden: !store.currentFileId }"></div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background);
}

.editor-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: var(--color-text-muted);
}

.placeholder-content svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.placeholder-content p {
  font-size: var(--font-size-base);
}

.editor-container {
  flex: 1;
  overflow: hidden;
  min-width: 300px;
}

.editor-container.hidden {
  display: none;
}

.editor-container :deep(.vditor) {
  height: 100%;
  border: none;
}

.editor-container :deep(.vditor-content) {
  height: 100%;
}

.editor-container :deep(.vditor-sv),
.editor-container :deep(.vditor-preview) {
  min-width: 200px;
}
</style>