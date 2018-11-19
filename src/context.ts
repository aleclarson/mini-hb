import { AnyObj, dlv, flatMap } from './common'

const unwrapContext = (ctx: AnyObj) =>
  ctx instanceof Context ? ctx.stack : ctx

/** A stack of variable maps */
export class Context {
  readonly stack: AnyObj[]

  constructor(stack?: AnyObj[]) {
    this.stack = stack ? flatMap(stack, unwrapContext) : []
  }

  get(key: string) {
    let { stack } = this
    let path = key.split('.')
    for (let i = stack.length; i > 0; ) {
      let value = dlv(stack[--i], path)
      if (value !== undefined) {
        return value
      }
    }
    return ''
  }

  concat(...contexts: AnyObj[]) {
    let stack = this.stack.concat(flatMap(contexts, unwrapContext))
    return stack.length == this.stack.length ? this : new Context(stack)
  }
}
