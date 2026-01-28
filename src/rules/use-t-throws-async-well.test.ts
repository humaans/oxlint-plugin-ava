import test from 'ava'
import { RuleTester } from 'oxlint'
import { useTThrowsAsyncWell } from './use-t-throws-async-well.ts'

const ruleTester = new RuleTester()

test('use-t-throws-async-well', t => {
  ruleTester.run('use-t-throws-async-well', useTThrowsAsyncWell, {
    valid: [
      // Sync test can use t.throws()
      `test('sync test', t => { t.throws(() => fn()) })`,
      `test('sync test', t => { t.notThrows(() => fn()) })`,

      // Async test using async versions
      `test('async test', async t => { await t.throwsAsync(fn()) })`,
      `test('async test', async t => { await t.notThrowsAsync(fn()) })`,

      // Regular async test without throws
      `test('async test', async t => { t.pass() })`,

      // Not a test call
      `something('not a test', async t => { t.throws(() => fn()) })`,

      // Sync function expression
      `test('sync test', function(t) { t.throws(() => fn()) })`,
    ],

    invalid: [
      // t.throws() in async arrow function
      {
        code: `test('async test', async t => { t.throws(() => fn()) })`,
        errors: [
          { message: /Use t\.throwsAsync\(\) instead of t\.throws\(\)/ },
        ],
      },
      // t.notThrows() in async arrow function
      {
        code: `test('async test', async t => { t.notThrows(() => fn()) })`,
        errors: [
          { message: /Use t\.notThrowsAsync\(\) instead of t\.notThrows\(\)/ },
        ],
      },
      // t.throws() in async function expression
      {
        code: `test('async test', async function(t) { t.throws(() => fn()) })`,
        errors: [
          { message: /Use t\.throwsAsync\(\) instead of t\.throws\(\)/ },
        ],
      },
      // Multiple violations
      {
        code: `test('async test', async t => { t.throws(() => a()); t.notThrows(() => b()) })`,
        errors: [
          { message: /Use t\.throwsAsync\(\) instead of t\.throws\(\)/ },
          { message: /Use t\.notThrowsAsync\(\) instead of t\.notThrows\(\)/ },
        ],
      },
      // With test modifiers
      {
        code: `test.serial('async test', async t => { t.throws(() => fn()) })`,
        errors: [
          { message: /Use t\.throwsAsync\(\) instead of t\.throws\(\)/ },
        ],
      },
      // t.throws() inside nested function within async test
      {
        code: `test('async test', async t => {
          const check = () => { t.throws(() => fn()) }
          check()
        })`,
        errors: [
          { message: /Use t\.throwsAsync\(\) instead of t\.throws\(\)/ },
        ],
      },
    ],
  })
  t.pass()
})

test('use-t-throws-async-well - nested callbacks', t => {
  ruleTester.run('use-t-throws-async-well', useTThrowsAsyncWell, {
    valid: [
      // Sync throws inside sync callback within sync test
      `test('sync test', t => {
        items.forEach(() => {
          t.throws(() => fn())
        })
      })`,
      // Async throws inside async test with nested callbacks
      `test('async test', async t => {
        await Promise.all(items.map(async () => {
          await t.throwsAsync(fn())
        }))
      })`,
    ],
    invalid: [
      // Sync throws inside nested callback within async test
      {
        code: `test('async test', async t => {
          items.forEach(() => {
            t.throws(() => fn())
          })
        })`,
        errors: [
          { message: /Use t\.throwsAsync\(\) instead of t\.throws\(\)/ },
        ],
      },
      // Sync throws inside Promise.all within async test
      {
        code: `test('async test', async t => {
          await Promise.all(items.map(() => {
            t.throws(() => fn())
          }))
        })`,
        errors: [
          { message: /Use t\.throwsAsync\(\) instead of t\.throws\(\)/ },
        ],
      },
    ],
  })
  t.pass()
})
