import { parse } from '../lib/parser'

const parseSnapshot = (template: string) => {
  let nodes = parse(template)
  expect(nodes).toMatchSnapshot()
  return nodes
}

const parseThrows = (template: string) =>
  expect(() => parse(template)).toThrowErrorMatchingSnapshot()

test('empty node', () => {
  parseThrows('{{}}')
})

test('line breaks', () => {
  parseSnapshot(' \n \n{{a}}\n\n {{b}} \n')
})

describe('variable node', () => {
  test('with common padding', () => {
    parseSnapshot('{{a}}')
    parseSnapshot('{{ a }}')
  })
  test('with creative padding', () => {
    parseSnapshot('{{ a}}')
    parseSnapshot('{{  a    }}')
  })
  test('with spacing around', () => {
    parseSnapshot('  {{a }} ')
  })
  test('that spans multiple lines', () => {
    parseSnapshot(`
      foo
      {{
        a
      }}
      bar
    `)
  })
})

describe('variable names', () => {
  test('follow Javascript rules exactly', () => {
    parseSnapshot('{{ __aAoOzZ_$0123456789$$ }}')
  })
  test('can use dot-notation', () => {
    parseSnapshot('{{ a.b.c.d }}')
  })
  test('cannot use bracket-notation (yet?)', () => {
    parseThrows('{{ a[b[c]][d] }}')
  })
  test('cannot be a number', () => {
    parseThrows('{{ 12345 }}')
    parseThrows('{{ 12.34 }}')
  })
  test('cannot start with a number', () => {
    parseThrows('{{ 0z }}')
  })
  test('cannot contain dashes', () => {
    parseThrows('{{ a--b-c }}')
  })
})

describe('function call', () => {
  test('with one argument', () => {
    parseSnapshot('{{ fn z }}')
  })
  test('with many arguments', () => {
    let args = new Array(10)
      .fill(null)
      .map((_, i) => 'z' + i)
      .join(', ')

    parseSnapshot(`{{ fn ${args} }}`)
  })
  test('with primitive arguments', () => {
    parseSnapshot('{{ fn 0, -0.5, 1, true, false, null }}')
  })
  test('with no argument spacing', () => {
    parseSnapshot('{{fn 1,2,a,b,null}}')
  })
  test('with creative spacing', () => {
    parseSnapshot('{{ fn  1, 2,   3,  4, 5}}')
  })
})

describe('block node', () => {
  test('without a body', () => {
    parseSnapshot('{{#a}}{{/a}}')
  })
  test('with a variable inside', () => {
    parseSnapshot('{{#a}} {{b}} {{/a}}')
  })
  test('with a block inside', () => {
    parseSnapshot('{{#a}} {{#b}} {{/b}} {{/a}}')
  })
  test('that spans multiple lines', () => {
    parseSnapshot('{{#a}}\n  Hello world\n{{/a}}')
  })
  test('with a head and tail that span multiple lines', () => {
    parseSnapshot(`
      foo
      {{
        #a
      }}
        Hello world
      {{
        /a
      }}
      bar
    `)
  })
})

test('unclosed node', () => {
  parseThrows('{{')
  parseThrows('{{a')
  parseThrows('{{a}')
})

test('unclosed block', () => {
  parseThrows('{{#a}}')
})

test('parent block closed before child', () => {
  parseThrows('{{#a}} {{#b}} {{/a}}')
})

// Escaping is not yet supported.
xtest('escaped left bracket', () => {
  parseSnapshot('\\{{')
})
