import type { Context, Rule, Visitor, ESTree } from '../types.js'

/**
 * Disallow `test.only()` in committed code.
 *
 * `test.only()` causes AVA to run only that specific test, which is useful
 * during development but should never be committed as it prevents other
 * tests from running in CI.
 *
 * @example
 * // ❌ Invalid
 * test.only('my test', t => { ... })
 * test.serial.only('my test', t => { ... })
 *
 * // ✅ Valid
 * test('my test', t => { ... })
 * test.serial('my test', t => { ... })
 */
export const noOnlyTest: Rule = {
  create(context: Context) {
    return {
      CallExpression(node) {
        // Match: test.only(...) or test.serial.only(...) etc.
        const onlyNode = findModifierNode(node, 'only')
        if (onlyNode) {
          context.report({
            message: 'test.only is not allowed in committed code',
            node: onlyNode,
          })
        }
      },
    } as Visitor
  },
}

function findModifierNode(
  node: ESTree.CallExpression,
  modifier: string,
): ESTree.Identifier | null {
  let current: ESTree.Expression | undefined = node.callee
  while (current) {
    if (current.type === 'MemberExpression') {
      const prop = current.property
      if (prop.type === 'Identifier' && prop.name === modifier) {
        // Check if the chain starts with 'test'
        if (hasTestRoot(current.object)) {
          return prop
        }
      }
      current = current.object
    } else {
      break
    }
  }
  return null
}

function hasTestRoot(node: ESTree.Expression | undefined): boolean {
  if (!node) return false
  if (node.type === 'Identifier' && node.name === 'test') return true
  if (node.type === 'MemberExpression') {
    return hasTestRoot(node.object)
  }
  return false
}
