import test from 'ava'
import { RuleTester } from 'oxlint'
import { noNestedTests } from './no-nested-tests.ts'

const ruleTester = new RuleTester()

test('no-nested-tests', t => {
  ruleTester.run('no-nested-tests', noNestedTests, {
    valid: [
      // Multiple top-level tests
      `test('first', t => { t.pass() }); test('second', t => { t.pass() })`,

      // Test with modifiers
      `test.serial('test', t => { t.pass() })`,

      // Not a test call inside
      `test('test', t => { something('not a test', () => {}) })`,

      // Function that looks like test but isn't
      `something('outer', () => { test('inner', t => { t.pass() }) })`,
    ],

    invalid: [
      // Basic nested test
      {
        code: `test('outer', t => { test('inner', t => { t.pass() }) })`,
        errors: [{ message: /Nested tests are not supported/ }],
      },
      // Nested test with modifiers
      {
        code: `test('outer', t => { test.serial('inner', t => { t.pass() }) })`,
        errors: [{ message: /Nested tests are not supported/ }],
      },
      // Outer test with modifiers
      {
        code: `test.serial('outer', t => { test('inner', t => { t.pass() }) })`,
        errors: [{ message: /Nested tests are not supported/ }],
      },
      // Multiple nested tests
      {
        code: `test('outer', t => { test('inner1', t => {}); test('inner2', t => {}) })`,
        errors: [
          { message: /Nested tests are not supported/ },
          { message: /Nested tests are not supported/ },
        ],
      },
      // Deeply nested
      {
        code: `test('a', t => { test('b', t => { test('c', t => {}) }) })`,
        errors: [
          { message: /Nested tests are not supported/ },
          { message: /Nested tests are not supported/ },
        ],
      },
    ],
  })
  t.pass()
})
