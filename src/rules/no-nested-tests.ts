import type { Context, Rule, Visitor, ESTree } from '../types.js'

/**
 * Disallow nested tests.
 *
 * AVA does not support nested tests. Tests defined inside other tests
 * will not be discovered or run correctly.
 *
 * @example
 * // ❌ Invalid
 * test('outer', t => {
 *   test('inner', t => { ... })  // This test won't run!
 * })
 *
 * // ✅ Valid
 * test('first test', t => { ... })
 * test('second test', t => { ... })
 */
export const noNestedTests: Rule = {
  create(context: Context) {
    let testDepth = 0

    return {
      CallExpression(node) {
        if (isTestCall(node)) {
          if (testDepth > 0) {
            context.report({
              message: 'Nested tests are not supported in AVA',
              node,
            })
          }
          testDepth++
        }
      },
      'CallExpression:exit'(node) {
        if (isTestCall(node)) {
          testDepth--
        }
      },
    } as Visitor
  },
}

function isTestCall(node: ESTree.CallExpression): boolean {
  let current: ESTree.Expression | undefined = node.callee
  while (current) {
    if (current.type === 'Identifier' && current.name === 'test') {
      return true
    }
    if (current.type === 'MemberExpression') {
      current = current.object
    } else {
      break
    }
  }
  return false
}
