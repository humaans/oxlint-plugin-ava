import type { Context, Rule, Visitor, ESTree } from '../types.js'

/**
 * Enforce using `t.throwsAsync()` in async tests.
 *
 * In async test functions, `t.throws()` and `t.notThrows()` don't work
 * correctly with promises. You must use `t.throwsAsync()` and
 * `t.notThrowsAsync()` instead to properly catch async errors.
 *
 * @example
 * // ❌ Invalid
 * test('async test', async t => {
 *   t.throws(() => asyncFn())      // Won't catch async errors
 *   t.notThrows(() => asyncFn())
 * })
 *
 * // ✅ Valid
 * test('async test', async t => {
 *   await t.throwsAsync(asyncFn())
 *   await t.notThrowsAsync(asyncFn())
 * })
 *
 * // ✅ Valid (sync test can use sync throws)
 * test('sync test', t => {
 *   t.throws(() => syncFn())
 * })
 */
export const useTThrowsAsyncWell: Rule = {
  create(context: Context) {
    // Use a stack to handle nested test calls properly
    const asyncTestStack: boolean[] = []

    return {
      // Track when we enter an async test function
      CallExpression(node) {
        if (isTestCall(node)) {
          const testFn = getTestFunction(node)
          asyncTestStack.push(testFn?.async === true)
        }

        // Check for t.throws() or t.notThrows() in async context
        const inAsyncTest = asyncTestStack.includes(true)
        if (inAsyncTest && isSyncThrowsCall(node)) {
          const methodName = getMethodName(node)
          context.report({
            message: `Use t.${methodName}Async() instead of t.${methodName}() in async tests`,
            node,
          })
        }
      },
      'CallExpression:exit'(node) {
        if (isTestCall(node) && asyncTestStack.length > 0) {
          asyncTestStack.pop()
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

type FunctionNode = ESTree.Function

function getTestFunction(
  node: ESTree.CallExpression,
): FunctionNode | undefined {
  const args = node.arguments
  return args.find(
    (arg): arg is FunctionNode =>
      arg.type === 'FunctionExpression' ||
      arg.type === 'ArrowFunctionExpression',
  )
}

function isSyncThrowsCall(node: ESTree.CallExpression): boolean {
  const callee = node.callee
  if (callee.type !== 'MemberExpression') return false

  const object = callee.object
  const prop = callee.property
  if (object.type !== 'Identifier' || object.name !== 't') return false
  if (prop.type !== 'Identifier') return false

  return prop.name === 'throws' || prop.name === 'notThrows'
}

function getMethodName(node: ESTree.CallExpression): string {
  const callee = node.callee
  if (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier'
  ) {
    return callee.property.name
  }
  return ''
}
