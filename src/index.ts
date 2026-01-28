import type { Plugin } from './types.js'
import { noDuplicateModifiers } from './rules/no-duplicate-modifiers.js'
import { noNestedTests } from './rules/no-nested-tests.js'
import { noOnlyTest } from './rules/no-only-test.js'
import { noSkipAssert } from './rules/no-skip-assert.js'
import { noTodoImplementation } from './rules/no-todo-implementation.js'
import { noUnknownModifiers } from './rules/no-unknown-modifiers.js'
import { useTThrowsAsyncWell } from './rules/use-t-throws-async-well.js'

const plugin: Plugin = {
  meta: { name: 'ava' },
  rules: {
    'no-duplicate-modifiers': noDuplicateModifiers,
    'no-nested-tests': noNestedTests,
    'no-only-test': noOnlyTest,
    'no-skip-assert': noSkipAssert,
    'no-todo-implementation': noTodoImplementation,
    'no-unknown-modifiers': noUnknownModifiers,
    'use-t-throws-async-well': useTThrowsAsyncWell,
  },
}

export default plugin
