import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type StorageMode = 'folder' | 'sqlite'
export type EditorMode = 'wysiwyg' | 'sv' | 'ir' | 'source'

export interface FileNode {
  id: string
  name: string
  path: string
  isFolder: boolean
  children?: FileNode[]
  expanded?: boolean
  content?: string
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  modifiedAt: number
  parentId: string | null
}

const STORAGE_KEY = 'knoted-app-settings'

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  return null
}

const saveSettings = (settings: Record<string, unknown>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

export const useAppStore = defineStore('app', () => {
  const savedSettings = loadSettings()
  
  const theme = ref<'light' | 'dark'>(savedSettings?.theme ?? 'dark')
  const storageMode = ref<StorageMode>(savedSettings?.storageMode ?? 'sqlite')
  const editorMode = ref<EditorMode>(savedSettings?.editorMode ?? 'sv')
  const currentFileId = ref<string | null>(null)
  const fileTree = ref<FileNode[]>([])
  const notes = ref<Note[]>([])
  const sidebarCollapsed = ref(false)
  const sidebarWidth = ref(240)
  const isLoading = ref(false)
  const editorWordCount = ref(0)
  const editorCharCount = ref(0)
  const noteUpdateCount = ref(0)

  const currentFile = computed(() => {
    if (storageMode.value === 'folder') {
      return fileTree.value.find(f => f.id === currentFileId.value)
    }
    return notes.value.find(n => n.id === currentFileId.value)
  })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  function setStorageMode(mode: StorageMode) {
    storageMode.value = mode
    currentFileId.value = null
  }

  function setCurrentFile(id: string | null) {
    currentFileId.value = id
  }

  function setEditorMode(mode: EditorMode) {
    editorMode.value = mode
  }

  function setEditorStats(wordCount: number, charCount: number) {
    editorWordCount.value = wordCount
    editorCharCount.value = charCount
  }

  function incrementNoteUpdateCount() {
    noteUpdateCount.value++
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  watch([theme, storageMode, editorMode], () => {
    saveSettings({
      theme: theme.value,
      storageMode: storageMode.value,
      editorMode: editorMode.value,
    })
  })

  return {
    theme,
    storageMode,
    editorMode,
    currentFileId,
    fileTree,
    notes,
    sidebarCollapsed,
    sidebarWidth,
    isLoading,
    editorWordCount,
    editorCharCount,
    noteUpdateCount,
    currentFile,
    toggleTheme,
    setStorageMode,
    setEditorMode,
    setEditorStats,
    incrementNoteUpdateCount,
    setCurrentFile,
    toggleSidebar,
  }
})