
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

import {
  Callee,
  Signal,
  Message,
  ErrorMessage,
  Response,
  HandshakeRequest,
  CallRequest,
  Available,
  HandshakeResponse,
  CallResponse,
  Expose,
  CrossCallHostOptions,
  CrossCallClientOptions
} from "./interfaces"

const errtag = "crosscall error -"

export class CrossCallHost<gCallee extends Callee = Callee> {
  private readonly expose: Expose
  private messageId = 0

  private sendMessage(data: Message, target: string) {
    const payload = {...data, id: this.messageId++}
    window.parent.postMessage(JSON.stringify(payload), target)
  }

  /**
   * Handle a request from the crosscall client
   */
  private readonly handleRequest = async(message: MessageEvent) => {
    const {expose} = this
    const {origin: messageOrigin, data} = message
    const {id, signal, topic, method, params} = <CallRequest>data

    try {

      // ensure topic is exposed
      const permission = expose[topic]
      if (!permission) throw new Error(`${errtag} unknown topic "${topic}" not exposed`)

      // ensure message origin is allowed topic access
      const {callee, origin: originRegex, methods} = permission
      const originAllowed = originRegex.test(messageOrigin)
      if (!originAllowed) throw new Error(`${errtag} origin "${messageOrigin}" not allowed to access "${topic}"`)

      // ensure requested method is allowed
      const allowed = methods.find(m => m === method)
      if (!allowed) throw new Error(`${errtag} method "${topic}.${method}" not exposed`)

      // call the method and prepare the response
      const response = <CallResponse>{
        signal: Signal.Call,
        response: id,
        result: await callee[method](...params)
      }

      // send the response
      this.sendMessage(response, messageOrigin)
    }

    // send back any errors
    catch (error) {
      this.sendMessage(<ErrorMessage>{id, error: error.message}, messageOrigin)
    }
  }

  constructor({expose}: CrossCallHostOptions) {
    this.expose = expose
    const {handleRequest} = this
    window.addEventListener("message", handleRequest, false)
  }

  destructor() {
    const {handleRequest} = this
    window.removeEventListener("message", handleRequest)
  }
}

export class CrossCallClient {
  readonly callable: Callee
  constructor({}: CrossCallClientOptions) {}
}
