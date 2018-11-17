# mini-hb

[![npm](https://img.shields.io/npm/v/mini-hb.svg)](https://www.npmjs.com/package/mini-hb)
[![Build status](https://travis-ci.org/aleclarson/mini-hb.svg?branch=master)](https://travis-ci.org/aleclarson/mini-hb)
[![Coverage status](https://coveralls.io/repos/github/aleclarson/mini-hb/badge.svg?branch=master)](https://coveralls.io/github/aleclarson/mini-hb?branch=master)
[![Bundle size](https://badgen.net/bundlephobia/min/mini-hb)](https://bundlephobia.com/result?p=mini-hb)
[![Install size](https://packagephobia.now.sh/badge?p=mini-hb)](https://packagephobia.now.sh/result?p=mini-hb)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/alecdotbiz)

TypeScript successor to [mini-handlebars](https://www.npmjs.com/package/mini-handlebars)

```ts
import {hb} from 'mini-hb'

// Use an object literal to provide variables/functions to templates.
let context = {
  foo: 'foo',
  test(template, context) {
    // `template` is what your block contains.
    // `context` is the context your block has access to.
    // The return value is coerced to a string (but undefined is ignored).
    return hb(template, context)
  },
}

// Render a template.
let template = '{{ foo }}{{ bar }}'
let result = hb(template, context)

// Bind a template to `hb`
let render = hb.bind(template)
result = render(context) // "foo"

// Bind a context to `hb`
render = hb.bind(context)
result = render(template) // "foo"

// Bind many contexts to `hb`
render = hb.bind(context, { bar: 'bar' }, { foo: '' })
result = render(template) // "bar"

// Merge contexts into a new context. (null and undefined are skipped)
context = hb(context, { bar: 'bar' }, cond ? { foo: true } : null)
```

See [the tests](/spec) for more details.
