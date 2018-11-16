import { Context } from './context'
import { Block, Node } from './parser'

/** For knowing if an argument should be evaluated into a primitive */
const LITERAL_RE = /^(-?\d+(\.\d+)?|true|false|null)$/

/** The last line (if empty) */
const LAST_LINE_EMPTY = /\n[ ]*$/

/** For reference errors thrown by the renderer */
export interface IRenderError extends ReferenceError {
  node: Node
}

export type RenderFn<T extends any[] = any[]> = (
  body: string,
  context: Context,
  ...args: T
) => any

export function render(
  template: string,
  nodes: Array<Node | Block>,
  context: Context
) {
  if (nodes.length == 0) return template
  let payload = ''

  // Build the payload.
  let node: Node & Partial<Block>
  let prevNode: Node & Partial<Block> = null as any
  for (node of nodes as any) {
    let content: any
    if (node.args || node.head) {
      let head = node.head || node
      let body = node.body || ''

      // Ensure the function exists.
      let func: RenderFn = context.get(head.name)
      if (typeof func !== 'function') {
        let err = new ReferenceError(
          `No function named "${head.name}" exists`
        ) as IRenderError
        err.node = head
        throw err
      }

      // Prepare the arguments.
      let args: any[] = head.args || []
      if (head.args) {
        let i = 0
        do {
          let arg = args[i]
          args[i] = LITERAL_RE.test(arg) ? eval(arg) : context.get(arg)
        } while (++i < args.length)
      }

      content = func(body, context, ...args)
    } else {
      content = context.get(node.name)
    }

    /** The static content between nodes. */
    let slice = template.slice(
      prevNode ? prevNode.end : 0,
      (node.head || node).start
    )

    if (node.head) {
      // Lines with only {{ #foo }} or {{ /foo }} are omitted from the payload.
      slice = slice.replace(LAST_LINE_EMPTY, '')
    }

    payload += slice + (content !== undefined ? content : '')
    prevNode = node.tail || node
  }

  // Fin.
  return payload + template.slice(prevNode.end)
}
