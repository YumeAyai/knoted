import { ref } from 'vue'
import type { FileNode } from '@/stores/app'

const generateId = () => Math.random().toString(36).substring(2, 15)

export function useFileSystem() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const rootPath = ref('')
  const fileTree = ref<FileNode[]>([])

  const loadFileTree = async () => {
    isLoading.value = true
    error.value = null
    try {
      fileTree.value = [
        {
          id: 'root',
          name: 'Documents',
          path: '/',
          isFolder: true,
          expanded: true,
          children: []
        }
      ]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load files'
    } finally {
      isLoading.value = false
    }
  }

  const createFile = async (parentId: string, name: string) => {
    const newFile: FileNode = {
      id: generateId(),
      name: name.endsWith('.md') ? name : `${name}.md`,
      path: `${parentId}/${name}`,
      isFolder: false,
      content: ''
    }
    return newFile
  }

  const createFolder = async (parentId: string, name: string) => {
    const newFolder: FileNode = {
      id: generateId(),
      name,
      path: `${parentId}/${name}`,
      isFolder: true,
      children: [],
      expanded: false
    }
    return newFolder
  }

  const deleteFile = async (id: string) => {
    // Find and remove the file
  }

  const renameFile = async (id: string, newName: string) => {
    // Find and rename
  }

  const readFileContent = async (path: string): Promise<string> => {
    return ''
  }

  const writeFileContent = async (path: string, content: string) => {
    // Save to file system
  }

  return {
    isLoading,
    error,
    rootPath,
    fileTree,
    loadFileTree,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    readFileContent,
    writeFileContent
  }
}