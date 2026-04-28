<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useEditor } from '@/composables/useEditor'

const store = useAppStore()

const toggleSidebar = () => {
  store.toggleSidebar()
}

const toggleTheme = () => {
  store.toggleTheme()
}

const switchMode = (mode: 'wysiwyg' | 'sv' | 'ir') => {
  store.setEditorMode(mode)
}
</script>

<template>
  <header class="toolbar">
    <div class="toolbar-left">
      <button class="btn-toolbar" @click="toggleSidebar" title="Toggle Sidebar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
      </button>

      <div class="toolbar-divider"></div>

      <div class="toolbar-modes">
        <button
          class="btn-mode"
          :class="{ active: store.editorMode === 'wysiwyg' }"
          @click="switchMode('wysiwyg')"
          title="WYSIWYG Mode"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            <path d="M2 2l7.586 7.586"/>
            <circle cx="11" cy="11" r="2"/>
          </svg>
          <span>WYSIWYG</span>
        </button>
        <button
          class="btn-mode"
          :class="{ active: store.editorMode === 'sv' }"
          @click="switchMode('sv')"
          title="Split Mode"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="12" y1="3" x2="12" y2="21"/>
          </svg>
          <span>Split</span>
        </button>
        <button
          class="btn-mode"
          :class="{ active: store.editorMode === 'ir' }"
          @click="switchMode('ir')"
          title="Source Mode"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          <span>Source</span>
        </button>
      </div>
    </div>

    <div class="toolbar-center">
      <span class="app-title">Knoted</span>
    </div>

    <div class="toolbar-right">
      <button class="btn-toolbar" @click="store.setStorageMode('sqlite')" :class="{ active: store.storageMode === 'sqlite' }" title="SQLite Mode">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      </button>
      <button class="btn-toolbar" @click="store.setStorageMode('folder')" :class="{ active: store.storageMode === 'folder' }" title="Folder Mode">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      <div class="toolbar-divider"></div>

      <button class="btn-toolbar" @click="toggleTheme" :title="store.theme === 'light' ? 'Dark Mode' : 'Light Mode'">
        <svg v-if="store.theme === 'light'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  height: var(--toolbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  gap: var(--spacing-md);
  -webkit-app-region: drag;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  -webkit-app-region: no-drag;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.app-title {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  letter-spacing: 0.5px;
}

.btn-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.btn-toolbar:hover {
  background: var(--color-hover);
}

.btn-toolbar.active {
  background: var(--color-accent);
  color: white;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 var(--spacing-xs);
}

.toolbar-modes {
  display: flex;
  gap: 2px;
  background: var(--color-background);
  padding: 2px;
  border-radius: var(--radius-md);
}

.btn-mode {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.btn-mode:hover {
  color: var(--color-text);
  background: var(--color-hover);
}

.btn-mode.active {
  background: var(--color-surface);
  color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}
</style>