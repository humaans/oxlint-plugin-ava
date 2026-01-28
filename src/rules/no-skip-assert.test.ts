import test from 'ava'
import { RuleTester } from 'oxlint'
import { noSkipAssert } from './no-skip-assert.ts'

const ruleTester = new RuleTester()

test('no-skip-assert', t => {
  ruleTester.run('no-skip-assert', noSkipAssert, {
    valid: [
      `test('my test', t => { t.is(1, 1) })`,
      `test('my test', t => { t.pass() })`,
    ],
    invalid: [
      {
        code: `test('my test', t => { t.skip.is(1, 1) })`,
        errors: [{ message: /t\.skip/ }],
      },
      {
        code: `test('my test', t => { t.skip.pass() })`,
        errors: [{ message: /t\.skip/ }],
      },
    ],
  })
  t.pass()
})
