
export interface AsyncStorage {

  // standard methods
  clear(): Promise<void>
  getItem(key: string): Promise<string>
  key(index: number): Promise<string>
  removeItem(key: string): Promise<void>
  setItem(key: string): Promise<void>

  // non-standard
  getKeys(): Promise<string[]>
  listen(listener: (e: any) => void): Promise<number>
  unlisten(id: number): Promise<void>
}
