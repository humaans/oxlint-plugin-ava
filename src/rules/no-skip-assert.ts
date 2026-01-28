import type { Context, Rule, Visitor, ESTree } from '../types.js'

/**
 * Disallow `t.skip` assertion modifier.
 *
 * `t.skip.is()`, `t.skip.deepEqual()`, etc. skip individual assertions
 * within a test. This is useful during development but should not be
 * committed as it silently skips important assertions.
 *
 * @example
 * // ❌ Invalid
 * t.skip.is(foo, bar)
 * t.skip.deepEqual(obj1, obj2)
 *
 * // ✅ Valid
 * t.is(foo, bar)
 * t.deepEqual(obj1, obj2)
 */
export const noSkipAssert: Rule = {
  create(context: Context) {
    return {
      CallExpression(node) {
        // Match: t.skip.is(), t.skip.deepEqual(), etc.
        if (isTSkipCall(node)) {
          context.report({
            message: 't.skip assertions are not allowed',
            node,
          })
        }
      },
    } as Visitor
  },
}

function isTSkipCall(node: ESTree.CallExpression): boolean {
  const callee = node.callee
  if (callee.type !== 'MemberExpression') return false

  // Check for t.skip.* pattern
  const object = callee.object
  if (object.type === 'MemberExpression') {
    const innerObject = object.object
    const innerProp = object.property
    if (
      innerObject.type === 'Identifier' &&
      innerObject.name === 't' &&
      innerProp.type === 'Identifier' &&
      innerProp.name === 'skip'
    ) {
      return true
    }
  }

  return false
}
