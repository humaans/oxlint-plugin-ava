import test from 'ava'
import { RuleTester } from 'oxlint'
import { noUnknownModifiers } from './no-unknown-modifiers.ts'

const ruleTester = new RuleTester()

test('no-unknown-modifiers', t => {
  ruleTester.run('no-unknown-modifiers', noUnknownModifiers, {
    valid: [
      `test('my test', t => { t.pass() })`,
      `test.serial('my test', t => { t.pass() })`,
      `test.only('my test', t => { t.pass() })`,
      `test.skip('my test', t => { t.pass() })`,
      `test.todo('my future test')`,
      `test.failing('my test', t => { t.fail() })`,
      `test.serial.only('my test', t => { t.pass() })`,
      `something.unknown('not a test')`,
    ],
    invalid: [
      {
        code: `test.unknown('my test', t => { t.pass() })`,
        errors: [{ message: /Unknown modifier 'unknown'/ }],
      },
      {
        code: `test.serial.foo('my test', t => { t.pass() })`,
        errors: [{ message: /Unknown modifier 'foo'/ }],
      },
    ],
  })
  t.pass()
})
