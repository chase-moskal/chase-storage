
export interface Callee {
  [key: string]: (...args: any[]) => Promise<any>
}

export interface Permission {
  origin: RegExp
  allow: string[]
}

export interface CrossCallHostOptions<gCallee extends Callee = Callee> {
  callee: gCallee
  permissions: Permission[]
}

export type Response = {id: string} & ({data: any} | {error: string})

export interface Request {
  id: string
  method: string
  params: any[]
}

export class CrossCallHost<gCallee extends Callee = Callee> {
  private readonly errtag = "cross rpc error -"
  private readonly callee: gCallee
  private readonly permissions: Permission[]

  private readonly sendResponse = (payload: Response) => {
    window.parent.postMessage(JSON.stringify(payload), "*")
  }

  private readonly handleRequest = async(message: MessageEvent) => {
    const {callee, permissions} = this
    const {origin, data} = message
    const {id, method, params} = <Request>data

    const permission = permissions.find(perm => perm.origin.test(origin))
    if (!permission)
      throw new Error(`${this.errtag} no permission for origin "${origin}"`)

    const allowed = permission.allow.find(allowance => allowance === method)
    if (!allowed)
      throw new Error(`${this.errtag} permission "${method}" not allowed`)

    try {
      const result = await callee[method](...params)
      this.sendResponse({id, data: result})
    }
    catch (error) {
      this.sendResponse({id, error: error.message})
    }
  }

  constructor({callee, permissions}: CrossCallHostOptions<gCallee>) {
    this.callee = callee
    this.permissions = permissions

    const {handleRequest} = this
    window.addEventListener("message", handleRequest, false)
  }

  destructor() {
    const {handleRequest} = this
    window.removeEventListener("message", handleRequest)
  }
}

export function createCrossCallClient() {

}

/*

const host = new CrossCallHost({
  expose: {
    "asyncLocalStorage": {
      callee: new AsyncLocalStorage(),
      origin: /example\.com$/,
      methods: ["getItem", "setItem"]
    }
  }
}

const client = new CrossCallClient({
  host: "https://example.com/crosscall",
  callable: {
    "asyncLocalStorage": ["getItem", "setItem"]
  }
})

await client.callable.asyncLocalStorage.getItem("lol")

*/
