import test from 'ava'
import { RuleTester } from 'oxlint'
import { noOnlyTest } from './no-only-test.ts'

const ruleTester = new RuleTester()

test('no-only-test', t => {
  ruleTester.run('no-only-test', noOnlyTest, {
    valid: [
      `test('my test', t => { t.pass() })`,
      `test.serial('my test', t => { t.pass() })`,
      `something.only('not a test')`,
    ],
    invalid: [
      {
        code: `test.only('my test', t => { t.pass() })`,
        errors: [{ message: /test\.only/ }],
      },
      {
        code: `test.serial.only('my test', t => { t.pass() })`,
        errors: [{ message: /test\.only/ }],
      },
    ],
  })
  t.pass()
})
