import { AnyObj, dlv, flatMap } from './common'

/** A stack of variable maps */
export class Context {
  readonly stack: AnyObj[]

  constructor(contexts: AnyObj[]) {
    this.stack = createStack(contexts)
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
    let stack = this.stack.concat(createStack(contexts))
    return stack.length == this.stack.length ? this : new Context(stack)
  }
}

const createStack = (contexts: AnyObj[]) =>
  flatMap(contexts, unwrapContext).filter(isTruthy)

const unwrapContext = (ctx: AnyObj) =>
  ctx instanceof Context ? ctx.stack : ctx

const isTruthy = (value: any) => !!value
