import { ref, onMounted } from 'vue'
import type initSqlJs from 'sql.js'
import type { Note } from '@/stores/app'
import { useAppStore } from '@/stores/app'

const generateId = () => Math.random().toString(36).substring(2, 15)

const mapRowToNote = (row: any[]): Note => ({
  id: row[0] as string,
  title: row[1] as string,
  content: row[2] as string,
  tags: JSON.parse(row[3] as string || '[]'),
  createdAt: row[4] as number,
  modifiedAt: row[5] as number,
  parentId: row[6] as string | null
})

const mapResultsToNotes = (results: any[]): Note[] => {
  if (!results.length) return []
  return results[0].values.map(mapRowToNote)
}

export function useDatabase() {
  const db = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const store = useAppStore()

  const checkDbInitialized = () => {
    if (!db.value) {
      throw new Error('Database not initialized')
    }
  }

  const initDatabase = async () => {
    if (db.value) return

    isLoading.value = true
    error.value = null
    try {
      const SQL = (await import('sql.js')).default
      const initSql = SQL as unknown as { default: (config?: { locateFile?: (file: string) => string }) => Promise<{ Database: new (data?: ArrayLike<number> | null) => any }> }

      const SqlJs = initSql.default || SQL

      const sqlJs = await SqlJs({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/${file}`
      })

      const savedDb = localStorage.getItem('knoted-db')
      if (savedDb) {
        const data = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0))
        db.value = new sqlJs.Database(data)
      } else {
        db.value = new sqlJs.Database()
        db.value.run(`
          CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            tags TEXT,
            createdAt INTEGER,
            modifiedAt INTEGER,
            parentId TEXT
          )
        `)
        db.value.run(`
          CREATE INDEX IF NOT EXISTS idx_notes_parentId ON notes(parentId)
        `)
        db.value.run(`
          CREATE INDEX IF NOT EXISTS idx_notes_modifiedAt ON notes(modifiedAt DESC)
        `)
        saveDatabase()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to init database'
      console.error('Database initialization error:', e)
    } finally {
      isLoading.value = false
    }
  }

  const saveDatabase = () => {
    if (!db.value) return
    try {
      const data = db.value.export()
      const blob = new Blob([data], { type: 'application/octet-stream' })
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const base64 = btoa(String.fromCharCode(...new Uint8Array(reader.result as ArrayBuffer)))
          localStorage.setItem('knoted-db', base64)
        } catch (e) {
          console.error('Failed to save database:', e)
          error.value = 'Failed to save database'
        }
      }
      reader.readAsArrayBuffer(blob)
    } catch (e) {
      console.error('Failed to export database:', e)
      error.value = 'Failed to export database'
    }
  }

  const getNoteById = (id: string): Note | null => {
    if (!db.value) return null
    try {
      const results = db.value.exec('SELECT * FROM notes WHERE id = ?', [id])
      if (!results.length || !results[0].values.length) return null
      return mapRowToNote(results[0].values[0])
    } catch (e) {
      console.error('Failed to get note by id:', e)
      return null
    }
  }

  const getAllNotes = (): Note[] => {
    if (!db.value) return []
    try {
      const results = db.value.exec('SELECT * FROM notes ORDER BY modifiedAt DESC')
      return mapResultsToNotes(results)
    } catch (e) {
      console.error('Failed to get all notes:', e)
      return []
    }
  }

  const getNotesByParentId = (parentId: string | null): Note[] => {
    if (!db.value) return []
    try {
      const results = db.value.exec(
        'SELECT * FROM notes WHERE parentId IS ? ORDER BY modifiedAt DESC',
        [parentId]
      )
      return mapResultsToNotes(results)
    } catch (e) {
      console.error('Failed to get notes by parentId:', e)
      return []
    }
  }

  const createNote = (title: string, content = '', parentId: string | null = null): Note => {
    checkDbInitialized()

    const now = Date.now()
    const note: Note = {
      id: generateId(),
      title: title.trim() || 'Untitled',
      content,
      tags: [],
      createdAt: now,
      modifiedAt: now,
      parentId
    }

    try {
      db.value.run(
        'INSERT INTO notes (id, title, content, tags, createdAt, modifiedAt, parentId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [note.id, note.title, note.content, JSON.stringify(note.tags), note.createdAt, note.modifiedAt, note.parentId]
      )
      saveDatabase()
      store.incrementNoteUpdateCount()
      return note
    } catch (e) {
      console.error('Failed to create note:', e)
      throw new Error('Failed to create note')
    }
  }

  const updateNote = (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'parentId'>>) => {
    checkDbInitialized()

    const now = Date.now()
    const sets: string[] = ['modifiedAt = ?']
    const values: any[] = [now]

    if (updates.title !== undefined) {
      sets.push('title = ?')
      values.push(updates.title.trim() || 'Untitled')
    }
    if (updates.content !== undefined) {
      sets.push('content = ?')
      values.push(updates.content)
    }
    if (updates.tags !== undefined) {
      sets.push('tags = ?')
      values.push(JSON.stringify(updates.tags))
    }
    if (updates.parentId !== undefined) {
      sets.push('parentId = ?')
      values.push(updates.parentId)
    }

    values.push(id)
    
    try {
      db.value.run(`UPDATE notes SET ${sets.join(', ')} WHERE id = ?`, values)
      saveDatabase()
      store.incrementNoteUpdateCount()
    } catch (e) {
      console.error('Failed to update note:', e)
      throw new Error('Failed to update note')
    }
  }

  const renameNote = (id: string, newTitle: string) => {
    return updateNote(id, { title: newTitle })
  }

  const moveNote = (id: string, newParentId: string | null) => {
    return updateNote(id, { parentId: newParentId })
  }

  const deleteNote = (id: string) => {
    checkDbInitialized()
    try {
      db.value.run('DELETE FROM notes WHERE id = ?', [id])
      saveDatabase()
      store.incrementNoteUpdateCount()
    } catch (e) {
      console.error('Failed to delete note:', e)
      throw new Error('Failed to delete note')
    }
  }

  const searchNotes = (query: string): Note[] => {
    if (!db.value || !query.trim()) return getAllNotes()
    
    try {
      const searchPattern = `%${query.trim()}%`
      const results = db.value.exec(
        'SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY modifiedAt DESC',
        [searchPattern, searchPattern]
      )
      return mapResultsToNotes(results)
    } catch (e) {
      console.error('Failed to search notes:', e)
      return []
    }
  }

  const getNoteCount = (): number => {
    if (!db.value) return 0
    try {
      const results = db.value.exec('SELECT COUNT(*) FROM notes')
      if (!results.length) return 0
      return results[0].values[0][0] as number
    } catch (e) {
      console.error('Failed to get note count:', e)
      return 0
    }
  }

  const clearAllNotes = () => {
    checkDbInitialized()
    try {
      db.value.run('DELETE FROM notes')
      saveDatabase()
    } catch (e) {
      console.error('Failed to clear all notes:', e)
      throw new Error('Failed to clear all notes')
    }
  }

  const exportDatabase = (): Uint8Array | null => {
    if (!db.value) return null
    try {
      return db.value.export()
    } catch (e) {
      console.error('Failed to export database:', e)
      return null
    }
  }

  const importDatabase = async (data: Uint8Array) => {
    try {
      const SQL = (await import('sql.js')).default
      const initSql = SQL as unknown as { default: (config?: { locateFile?: (file: string) => string }) => Promise<{ Database: new (data?: ArrayLike<number> | null) => any }> }

      const SqlJs = initSql.default || SQL
      const sqlJs = await SqlJs({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/${file}`
      })

      db.value = new sqlJs.Database(data)
      saveDatabase()
    } catch (e) {
      console.error('Failed to import database:', e)
      throw new Error('Failed to import database')
    }
  }

  onMounted(() => {
    initDatabase()
  })

  return {
    db,
    isLoading,
    error,
    initDatabase,
    saveDatabase,
    getNoteById,
    getAllNotes,
    getNotesByParentId,
    createNote,
    updateNote,
    renameNote,
    moveNote,
    deleteNote,
    searchNotes,
    getNoteCount,
    clearAllNotes,
    exportDatabase,
    importDatabase
  }
}