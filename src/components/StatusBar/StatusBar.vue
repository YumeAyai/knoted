<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore, type Note } from '@/stores/app'
import { useDatabase } from '@/composables/useDatabase'

const store = useAppStore()
const database = useDatabase()

const currentNote = computed((): Note | null => {
  if (store.storageMode === 'sqlite' && store.currentFileId) {
    return database.getNoteById(store.currentFileId) || null
  }
  return null
})

const fileTitle = computed(() => currentNote.value?.title || 'No file')
const wordCount = computed(() => store.editorWordCount)
const charCount = computed(() => store.editorCharCount)

const storageModeLabel = computed(() =>
  store.storageMode === 'sqlite' ? 'SQLite' : 'Folder'
)
</script>

<template>
  <footer class="statusbar">
    <div class="statusbar-left">
      <span class="status-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        {{ fileTitle }}
      </span>
    </div>

    <div class="statusbar-right">
      <span class="status-item storage-mode">
        {{ storageModeLabel }}
      </span>
      <span class="status-item">
        Words: {{ wordCount }}
      </span>
      <span class="status-item">
        Chars: {{ charCount }}
      </span>
    </div>
  </footer>
</template>

<style scoped>
.statusbar {
  height: var(--statusbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-muted);
}

.statusbar-left, .statusbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.storage-mode {
  padding: 2px 6px;
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 500;
}
</style>