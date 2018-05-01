
export interface Callee {
  [method: string]: (...args: any[]) => Promise<any>
}

export const enum Signal {
  Handshake,
  Call
}

export type Id = string

export interface Message {
  id?: Id
  signal: Signal
}

export interface Response {
  response: Id
}

export interface ErrorMessage extends Message, Partial<Response> {
  error: string
}

export interface HandshakeRequest extends Message {
  signal: Signal.Handshake
}

export interface CallRequest extends Message {
  signal: Signal.Call
  topic: string
  method: string
  params: any[]
}

export interface Available {
  [method: string]: string[]
}

export interface HandshakeResponse extends Message, Response {
  signal: Signal.Handshake
  available: Available
}

export interface CallResponse extends Message, Response {
  signal: Signal.Call
  result: any
}

export interface Expose {
  [topic: string]: {
    callee: Callee
    origin: RegExp
    methods: string[]
  }
}

export interface CrossCallHostOptions {
  expose: Expose
}

export interface CrossCallClientOptions {
  available: Available
}

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
