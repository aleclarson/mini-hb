import { hb } from '..'

describe('hb()', () => {
  it('can combine plain objects', () => {
    expect(hb({ a: 1 }, { a: 2 }).stack).toMatchSnapshot()
  })
  it('can combine two Context objects', () => {
    expect(hb(hb({ a: 1 }), hb({ a: 2 })).stack).toMatchSnapshot()
  })
  it('can be called with no args', () => {
    expect(hb().stack).toEqual([])
  })
  it('ignores falsy contexts', () => {
    expect(hb({ a: 1 }, null, void 0, { a: 2 }).stack).toMatchSnapshot()
  })
})

describe('hb.bind()', () => {
  let tpl = '{{a}}'
  it('can bind context only', () => {
    let render = hb.bind({ a: 1 }, { a: 2 })
    expect(render(tpl)).toBe('2')
    expect(render(tpl, { a: 3 })).toBe('3')
  })
  it('can bind the template only', () => {
    let render = hb.bind(tpl)
    expect(render()).toBe('')
    expect(render({ a: 0 })).toBe('0')
  })
  it('can bind both template and context', () => {
    let render = hb.bind(tpl, { a: 1 })
    expect(render()).toBe('1')
    expect(render({ a: 2 })).toBe('2')
  })
  it('defines \'template\' and \'context\' on the returned function', () => {
    let tpl = '{{a}},{{b}}'
    let ctx = hb({ a: 1 }, { b: 2 })

    // prettier-ignore
    expect([
      Object.assign({}, hb.bind(tpl)),
      Object.assign({}, hb.bind(ctx)),
      Object.assign({}, hb.bind(tpl, ctx)),
    ]).toMatchSnapshot()
  })
})
