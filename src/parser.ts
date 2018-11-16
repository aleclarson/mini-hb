import { AnyObj } from './common'
import { Context } from './context'

// Character codes
const LINE_BREAK = '\n'.charCodeAt(0)
const L_BRACKET = '{'.charCodeAt(0)
const R_BRACKET = '}'.charCodeAt(0)
const COMMA = ','.charCodeAt(0)
const SPACE = ' '.charCodeAt(0)
const SLASH = '/'.charCodeAt(0)
const HASH = '#'.charCodeAt(0)

/** For validating variable names */
const VAR_RE = /^[a-z_$][a-z0-9_.$]*$/i

/** For removing the first level of indentation */
const INDENT_RE = /(^|\n)  /g

/** The first line (if empty) */
const FIRST_LINE_EMPTY = /^[ ]*\n/

/** The last line (if empty) */
const LAST_LINE_EMPTY = /\n[ ]*$/

/** For defining a non-nullable property. */
const nil = undefined as any

type Options = {
  context?: AnyObj | Context
}

/** Each node represents a pair of `{{` and `}}` */
export interface Node {
  /** For blocks, this equals "#" for the head and "/" for the tail */
  type?: '#' | '/'
  /** The reference name */
  name: string
  /** Arguments to a function call */
  args?: string[]
  /** Character offset where this node begins */
  start: number
  /** The line number this node is on */
  line: number
  /** Character offset where this node ends */
  end: number
}

/** Each block represents a pair of `{{ #foo }}` and `{{ /foo }}` */
export interface Block {
  head: Node
  body: string
  tail: Node
  parent: Block | null
}

/** For syntax errors thrown by the parser */
export interface IParserError extends SyntaxError {
  node: Node
}

/** @internal */
export function parse(template: string) {
  /** List of top-level nodes */
  let nodes: Array<Node | Block> = []

  /** 0-based char offset */
  let i = -1

  /** 1-based line offset */
  let line = 1

  /** Current in-progress node */
  let node: Node | null = null

  /** Current block */
  let block: Block | null = null

  while (i < template.length - 1) {
    let ch = template.charCodeAt(++i)
    if (ch == LINE_BREAK) {
      line++
      continue
    }

    if (!node) {
      // Parse the opening brackets.
      if (ch !== L_BRACKET) continue
      ch = template.charCodeAt(i + 1)
      if (ch !== L_BRACKET) continue
      i++

      // Create an unclosed node.
      node = {
        type: nil,
        name: nil,
        args: nil,
        start: i - 1,
        line,
        end: nil,
      }
      continue
    }

    // Parse the closing brackets.
    if (ch !== R_BRACKET) continue
    ch = template.charCodeAt(i + 1)
    if (ch !== R_BRACKET) continue
    i++

    // Extract the contents between {{ and }}
    let content = template.slice(node.start + 2, i - 1).trim()
    node.end = i + 1

    // The first char indicates the node type.
    ch = content.charCodeAt(0)

    // Opening a block.
    if (ch == HASH) {
      node.type = '#'
      block = {
        head: parseNode(node, content, !!block),
        body: nil,
        tail: nil,
        parent: block,
      }
    }

    // Closing a block.
    else if (ch == SLASH) {
      node.type = '/'
      parseNode(node, content, !!block)

      if (!block || node.name !== block.head.name) {
        let err = new SyntaxError(
          `Unexpected closing node on line ${node.line}`
        ) as IParserError
        err.node = node
        throw err
      }

      if (!block.parent) {
        let body = template.slice(block.head.end, node.start)
        block.body =
          node.line == block.head.line
            ? body
            : body
                .replace(FIRST_LINE_EMPTY, '') // remove first line (if empty)
                .replace(LAST_LINE_EMPTY, '') // remove last line (if empty)
                .replace(INDENT_RE, '$1') // dedent one level

        block.tail = node
        nodes.push(block)
      }
      block = block.parent
    }

    // Push top-level nodes only.
    else if (!block) {
      nodes.push(parseNode(node, content))
    }

    // The node is fully parsed.
    node = null
  }

  // Were all nodes closed?
  if (node) {
    let err = new SyntaxError(
      `Unclosed node on line ${node.line}`
    ) as IParserError
    err.node = node
    throw err
  }

  // Were all blocks closed?
  if (block) {
    let err = new SyntaxError(
      `Unclosed block on line ${block.head.line}`
    ) as IParserError
    err.node = block.head
    throw err
  }

  return nodes
}

/** For parsing the content between `{{` and `}}` */
function parseNode(node: Node, content: string, skipArgs?: boolean) {
  let i = node.type ? 1 : 0

  // Parse the variable/function name.
  let name = ''
  for (; i < content.length; i++) {
    if (content.charCodeAt(i) == SPACE) break
    name += content[i]
  }

  // Validate the name.
  if (VAR_RE.test(name)) {
    node.name = name
  } else {
    throw badVariableName(name, node)
  }

  // Parse the arguments.
  if (!skipArgs && ++i < content.length) {
    let arg = ''
    let args = []
    for (; i < content.length; i++) {
      let ch = content.charCodeAt(i)
      if (ch == SPACE) continue
      if (ch == COMMA) {
        args.push(arg)
        arg = ''
      } else {
        arg += content[i]
      }
    }
    args.push(arg)
    node.args = args
  }

  return node
}

function badVariableName(name: string, node: Node) {
  let err = new SyntaxError(
    `Invalid variable name "${name}" on line ${node.line}`
  ) as IParserError
  err.node = node
  return err
}
