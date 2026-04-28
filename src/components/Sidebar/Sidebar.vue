<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore, type Note } from '@/stores/app'
import { useDatabase } from '@/composables/useDatabase'

const store = useAppStore()
const database = useDatabase()

const searchQuery = ref('')
const isCreatingFile = ref(false)
const newFileName = ref('')

const sidebarClass = computed(() => ({
  'sidebar': true,
  'sidebar--collapsed': store.sidebarCollapsed
}))

const notes = computed(() => {
  store.noteUpdateCount
  if (searchQuery.value) {
    return database.searchNotes(searchQuery.value)
  }
  return database.getAllNotes()
})

const handleNewFile = () => {
  isCreatingFile.value = true
  newFileName.value = ''
}

const confirmNewFile = () => {
  if (newFileName.value.trim()) {
    if (store.storageMode === 'sqlite') {
      const note = database.createNote(newFileName.value.trim())
      store.setCurrentFile(note.id)
    }
  }
  isCreatingFile.value = false
  newFileName.value = ''
}

const cancelNewFile = () => {
  isCreatingFile.value = false
  newFileName.value = ''
}

const selectFile = (id: string) => {
  store.setCurrentFile(id)
}

const deleteFile = (id: string, e: Event) => {
  e.stopPropagation()
  if (store.storageMode === 'sqlite') {
    database.deleteNote(id)
    if (store.currentFileId === id) {
      store.setCurrentFile(null)
    }
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <aside :class="sidebarClass" v-show="!store.sidebarCollapsed">
    <div class="sidebar-header">
      <div class="sidebar-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span>{{ store.storageMode === 'sqlite' ? 'Notes' : 'Files' }}</span>
      </div>
      <button class="btn-icon" @click="handleNewFile" title="New File">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <div class="sidebar-search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search..."
        class="search-input"
      />
    </div>

    <div class="sidebar-content">
      <!-- SQLite Mode -->
      <div v-if="store.storageMode === 'sqlite'" class="file-list">
        <div
          v-for="note in notes"
          :key="note.id"
          class="file-item"
          :class="{ 'file-item--active': store.currentFileId === note.id }"
          @click="selectFile(note.id)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <div class="file-info">
            <span class="file-name">{{ note.title }}</span>
            <span class="file-date">{{ formatDate(note.modifiedAt) }}</span>
          </div>
          <button class="btn-delete" @click="deleteFile(note.id, $event)" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>

        <div v-if="notes.length === 0" class="empty-state">
          <p>No notes yet</p>
          <button @click="handleNewFile" class="btn-create">Create your first note</button>
        </div>
      </div>

      <!-- Folder Mode -->
      <div v-else class="file-tree">
        <div class="empty-state">
          <p>Folder mode coming soon</p>
        </div>
      </div>
    </div>

    <!-- New File Dialog -->
    <div v-if="isCreatingFile" class="new-file-dialog">
      <input
        v-model="newFileName"
        type="text"
        placeholder="Note title"
        @keyup.enter="confirmNewFile"
        @keyup.esc="cancelNewFile"
        autofocus
      />
      <div class="dialog-actions">
        <button @click="cancelNewFile">Cancel</button>
        <button @click="confirmNewFile" class="btn-primary">Create</button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: 180px;
  max-width: 400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  transition: width var(--transition-normal), min-width var(--transition-normal);
  position: relative;
}

.sidebar--collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.sidebar-search {
  padding: var(--spacing-sm) var(--spacing-md);
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm);
  font-size: var(--font-size-xs);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.file-list, .file-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.file-item:hover {
  background: var(--color-hover);
}

.file-item--active {
  background: var(--color-accent);
  color: white;
}

.file-item--active .file-date {
  color: rgba(255, 255, 255, 0.7);
}

.file-item--active .btn-delete {
  color: white;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: var(--font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-date {
  font-size: 11px;
  color: var(--color-text-muted);
}

.btn-delete {
  opacity: 0;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast), background var(--transition-fast);
}

.file-item:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
}

.btn-create {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.btn-create:hover {
  opacity: 0.9;
}

.new-file-dialog {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.new-file-dialog input {
  width: 100%;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.dialog-actions button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.btn-primary {
  background: var(--color-accent);
  color: white;
}
</style>