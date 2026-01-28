import type { Context, Rule, Visitor, ESTree } from '../types.js'

/**
 * Disallow `test.todo()` with an implementation.
 *
 * `test.todo()` is meant as a placeholder for tests you plan to write.
 * It should only have a title string, not an implementation function.
 * If a function is provided, the test should use a regular `test()` call.
 *
 * @example
 * // ❌ Invalid
 * test.todo('my test', t => { ... })
 *
 * // ✅ Valid
 * test.todo('my test')
 * test('my test', t => { ... })
 */
export const noTodoImplementation: Rule = {
  create(context: Context) {
    return {
      CallExpression(node) {
        if (isTestTodoCall(node) && hasImplementation(node)) {
          context.report({
            message: 'test.todo() should not have an implementation',
            node,
          })
        }
      },
    } as Visitor
  },
}

function isTestTodoCall(node: ESTree.CallExpression): boolean {
  let current: ESTree.Expression | undefined = node.callee
  while (current) {
    if (current.type === 'MemberExpression') {
      const prop = current.property
      if (prop.type === 'Identifier' && prop.name === 'todo') {
        return hasTestRoot(current.object)
      }
      current = current.object
    } else {
      break
    }
  }
  return false
}

function hasTestRoot(node: ESTree.Expression | undefined): boolean {
  if (!node) return false
  if (node.type === 'Identifier' && node.name === 'test') return true
  if (node.type === 'MemberExpression') {
    return hasTestRoot(node.object)
  }
  return false
}

function hasImplementation(node: ESTree.CallExpression): boolean {
  const args = node.arguments
  // test.todo should only have a title (string), no function
  return args.some(
    arg =>
      arg.type === 'FunctionExpression' ||
      arg.type === 'ArrowFunctionExpression',
  )
}
