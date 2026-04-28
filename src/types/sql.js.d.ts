declare module 'sql.js' {
  const initSqlJs: (config?: { locateFile?: (file: string) => string }) => Promise<{
    Database: new (data?: ArrayLike<number> | null) => {
      run: (sql: string, params?: any[]) => void
      exec: (sql: string) => { columns: string[]; values: any[][] }[]
      export: () => Uint8Array
    }
  }>
  export default initSqlJs
}