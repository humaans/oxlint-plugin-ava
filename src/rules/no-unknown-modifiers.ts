import type { Context, Rule, Visitor, ESTree } from '../types.js'

/**
 * Disallow unknown test modifiers.
 *
 * AVA has a fixed set of valid modifiers. Using an unknown modifier
 * (e.g., `test.unknown()`) is likely a typo or mistake that will cause
 * the test to fail at runtime.
 *
 * Known modifiers: after, afterEach, always, before, beforeEach, cb,
 * failing, macro, only, serial, skip, todo
 *
 * @example
 * // ❌ Invalid
 * test.unknown('my test', t => { ... })
 * test.seriall('my test', t => { ... })  // typo
 *
 * // ✅ Valid
 * test.serial('my test', t => { ... })
 * test.only('my test', t => { ... })
 */

const KNOWN_MODIFIERS = new Set([
  'after',
  'afterAll',
  'afterEach',
  'always',
  'before',
  'beforeAll',
  'beforeEach',
  'cb',
  'failing',
  'macro',
  'only',
  'serial',
  'skip',
  'todo',
])

export const noUnknownModifiers: Rule = {
  create(context: Context) {
    return {
      CallExpression(node) {
        const modifiers = collectModifiers(node.callee)

        for (const mod of modifiers) {
          if (!KNOWN_MODIFIERS.has(mod)) {
            context.report({
              message: `Unknown modifier '${mod}' is not a valid AVA modifier`,
              node,
            })
          }
        }
      },
    } as Visitor
  },
}

function collectModifiers(node: ESTree.Expression | undefined): string[] {
  const modifiers: string[] = []
  let current = node

  while (current?.type === 'MemberExpression') {
    const prop = current.property
    if (prop.type === 'Identifier') {
      modifiers.push(prop.name)
    }
    current = current.object
  }

  // Only return modifiers if this is a test call
  if (current?.type === 'Identifier' && current.name === 'test') {
    return modifiers
  }

  return []
}
