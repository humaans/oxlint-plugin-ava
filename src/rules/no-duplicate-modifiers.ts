import type { Context, Rule, Visitor, ESTree } from '../types.js'

/**
 * Disallow duplicate test modifiers.
 *
 * Using the same modifier twice (e.g., `test.serial.serial()`) is likely
 * a mistake and has no effect. This rule catches accidental duplication.
 *
 * @example
 * // ❌ Invalid
 * test.serial.serial('my test', t => { ... })
 * test.only.only('my test', t => { ... })
 *
 * // ✅ Valid
 * test.serial('my test', t => { ... })
 * test.serial.only('my test', t => { ... })
 */
export const noDuplicateModifiers: Rule = {
  create(context: Context) {
    return {
      CallExpression(node) {
        const modifiers = collectModifiers(node.callee)
        const seen = new Set<string>()

        for (const mod of modifiers) {
          if (seen.has(mod)) {
            context.report({
              message: `Duplicate modifier '${mod}' is not allowed`,
              node,
            })
            break
          }
          seen.add(mod)
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
