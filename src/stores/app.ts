import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type StorageMode = 'folder' | 'sqlite'
export type EditorMode = 'wysiwyg' | 'sv' | 'ir'

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

export const useAppStore = defineStore('app', () => {
  const theme = ref<'light' | 'dark'>('light')
  const storageMode = ref<StorageMode>('folder')
  const editorMode = ref<EditorMode>('wysiwyg')
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