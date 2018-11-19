import { Context } from './context'

export type AnyObj = { [key: string]: any }

export type RenderFn = (template: string, ...contexts: AnyObj[]) => string

export type TemplateFn = (...contexts: AnyObj[]) => string

export interface IHandleBars {
  bind: IBindFn

  /** Parse a template and render it into a string */
  (template: string, ...contexts: AnyObj[]): string

  /** Create an immutable context that can be reused */
  (...contexts: AnyObj[]): Context
}

export interface IBoundProps {
  readonly template?: string
  readonly context: Context
}

export interface IBindFn extends Function {
  /** Bind a template (and optionally some context) to the renderer */
  (template: string, ...contexts: AnyObj[]): TemplateFn & IBoundProps

  /** Bind some context to the renderer */
  (...contexts: AnyObj[]): RenderFn & IBoundProps
}

export const isArray = Array.isArray

/** Deeply flatten an array of arrays */
export function flatMap<T, U>(
  src: T[],
  mapFn: (val: T, i: number) => U,
  dest: U[] = []
) {
  for (let i = 0, val; i < src.length; i++) {
    isArray((val = src[i]))
      ? flatMap(val as any, mapFn, dest)
      : dest.push(mapFn(val, i))
  }
  return dest
}

// https://github.com/developit/dlv
export function dlv(obj: AnyObj, path: string[], def?: any) {
  let p = 0
  while (obj && p < path.length) obj = obj[path[p++]]
  return obj === undefined || p < path.length ? def : obj
}
