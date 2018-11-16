import {
  AnyObj,
  IBoundProps,
  IHandleBars,
  RenderFn,
  TemplateFn,
} from './common'
import { Context } from './context'
import { parse } from './parser'
import { render } from './render'

interface AnyFn extends RenderFn, TemplateFn {}

type BoundRenderer = (RenderFn | TemplateFn) &
  { -readonly [P in keyof IBoundProps]?: IBoundProps[P] }

export const hb = (($0: string | AnyObj, ...contexts: AnyObj[]) => {
  if (typeof $0 == 'string') {
    let ctx =
      contexts.length == 1 && contexts[0] instanceof Context
        ? (contexts[0] as Context)
        : new Context(contexts)

    return render($0, parse($0), ctx)
  } else {
    return $0 instanceof Context
      ? $0.concat(contexts)
      : (contexts.unshift($0), new Context(contexts))
  }
}) as IHandleBars

// The `bind` method
hb.bind = ($0: string | AnyObj, ...contexts: AnyObj[]) => {
  let bound: BoundRenderer
  let ctx = new Context(contexts)
  if (typeof $0 == 'string') {
    let template = $0
    let nodes = parse($0)
    bound = (...contexts: AnyObj[]) =>
      render(template, nodes, ctx.concat(contexts))
    bound.template = template
  } else {
    ctx.stack.unshift($0)
    bound = (template: string, ...contexts: AnyObj[]) =>
      render(template, parse(template), ctx.concat(contexts))
  }
  bound.context = ctx
  return bound as any
}
