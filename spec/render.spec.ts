import { hb } from '..'

describe('context resolution', () => {
  it('prefers the rightmost context', () => {
    let res = hb('{{a}}', { a: 0 }, { a: 1 }, { a: 2 })
    expect(res).toBe('2')
  })
  it('checks each context object from right-to-left', () => {
    let res = hb('{{a}}', {}, { a: 1 }, { b: 2 }, { c: 3 })
    expect(res).toBe('1')
  })
  it('ignores null and undefined contexts', () => {
    let res = hb('{{a}}', { a: 0 }, null, { b: 1 }, undefined)
    expect(res).toBe('0')
  })
  it('allows dot-notation', () => {
    let res = hb('{{a.b.c}}', { a: { b: { c: 1 } } })
    expect(res).toBe('1')
  })
  it('returns an empty string for missing context', () => {
    let res = hb('{{a}}')
    expect(res).toBe('')

    res = hb('{{a.b.c}}')
    expect(res).toBe('')
  })
})

describe('rendering a template', () => {
  test('with no pairs of {{ and }}', () => {
    let noop = '{a}{b}{c}'
    expect(hb(noop)).toBe(noop)
  })
  test('with a dozen references in a row', () => {
    let res = hb('{{a}} '.repeat(12), { a: 1 })
    expect(res.length).toBe(24)
    expect(res).toMatchSnapshot()
  })
})

test('function call with no arguments', () => {
  let res = hb('{{a}}', {
    a: (...args) => {
      expect(args).toMatchSnapshot()
      return ''
    },
  })
  expect(res).toBe('')
  expect.assertions(2)
})

describe('any function call', () => {
  it('throws when the function is missing', () => {
    expect(() => {
      hb('{{a b}}')
    }).toThrowErrorMatchingSnapshot()
    expect(() => {
      hb('{{a.b c, d}}')
    }).toThrowErrorMatchingSnapshot()
  })
  it('is always passed an empty string and the context', () => {
    let ctx = hb({
      a: 1,
      b: 2,
      foo: ($1, $2, ...rest) => {
        expect($1).toBe('')
        expect($2).toBe(ctx)
        expect(rest).toEqual([1, 2])
      },
    })
    let _ = hb('{{foo a, b}}', ctx)
    expect.assertions(3)
  })
  it('can have (a subset of) primitive values for arguments', () => {
    // The values tested in here are the _only_ supported primitives.
    // Notably, undefined and quoted strings are not supported.
    let values = []
    for (let i = 0; i < 10; i++) values.push(i)
    values.push(-0.5, true, false, '' + null)
    let _ = hb(`{{a ${values.join(', ')}}}`, {
      a: (_1, _2, ...args) => (expect(args).toMatchSnapshot(), ''),
    })
    expect.assertions(1)
  })
  test('when undefined is returned, it is coerced to an empty string', () => {
    let res = hb('{{foo a}}', {
      foo: () => undefined,
    })
    expect(res).toBe('')
  })
  test('all other return values are appended to the payload string', () => {
    let values = [
      '',
      'foo',
      NaN,
      0,
      false,
      true,
      null,
      new Date(1542386668755),
      /.+/g,
      { a: 1 } as any,
      { toString: () => '{}' },
      () => {},
    ]
    expect(
      values.map(value => {
        let res = hb(' {{f a}} ', {
          f: () => value,
        })
        // This is required because of time zones.
        if (value instanceof Date) {
          expect(res).toBe(` ${value} `)
          return value.getTime()
        }
        return res
      })
    ).toMatchSnapshot()
    expect.assertions(2)
  })

  // TODO: Let arguments be regular expressions?
  xit('can have a RegExp literal as an argument', () => {
    expect(
      hb('{{a /.+/g}}', {
        a: (_1, _2, r) => r,
      })
    ).toMatchSnapshot()
  })
})

describe('any block', () => {
  it('throws when the function is missing', () => {
    expect(() => {
      hb('{{#a}} {{/a}}')
    }).toThrowErrorMatchingSnapshot()
    expect(() => {
      hb('{{#a.b}} {{/a.b}}')
    }).toThrowErrorMatchingSnapshot()
  })
  it('can render recursively', () => {
    let res = hb('{{#a}} {{#b}} {{c}} {{/b}} {{/a}}', {
      a: (body, ctx) => hb(body, ctx),
      b: body => hb(body, { c: 1 }),
    })
    expect(res).toBe('  1  ')
  })
  it('can take arguments', () => {
    let res = hb('{{#a b, c, d}}{{/a}}', {
      a: (tpl, ctx, b, c, d) => b + c + d,
      b: 1,
      c: 2,
      d: 4,
    })
    expect(res).toBe('7')
  })
  it('omits its first line when its head node is alone on that line', () => {
    let res = hb(' {{#a}} \nfoo {{/a}}', {
      a: tpl => tpl,
    })
    expect(res).toBe(' foo ')
  })
  it('omits its last line when its tail node is alone on that line', () => {
    let res = hb('{{#a}} foo\n {{/a}} ', {
      a: tpl => tpl,
    })
    expect(res).toBe(' foo ')
  })
  it('can omit both its first and last lines when they are empty', () => {
    let res = hb('{{#a}} \n  foo\n{{/a}} ', {
      a: tpl => tpl,
    })
    expect(res).toBe('foo ')
  })
})
