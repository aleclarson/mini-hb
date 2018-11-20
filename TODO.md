- add plugin system
- turn into a monorepo (w/ lerna)
- cache the AST of nested blocks for bound render functions

# Plugins

- `@mini-hb/plugin`: plugin driver
- `@mini-hb/js-expressions` (arbritrary JS expressions, using [bcx-expression-evaluator](https://github.com/buttonwoodcx/bcx-expression-evaluator))
- `@mini-hb/each`: the each block
- `@mini-hb/with`: the with block
- `@mini-hb/list`: the list block
- `@mini-hb/if`: the "if else" block
