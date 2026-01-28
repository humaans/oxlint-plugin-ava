import test from 'ava'
import { RuleTester } from 'oxlint'
import { noDuplicateModifiers } from './no-duplicate-modifiers.ts'

const ruleTester = new RuleTester()

test('no-duplicate-modifiers', t => {
  ruleTester.run('no-duplicate-modifiers', noDuplicateModifiers, {
    valid: [
      `test('my test', t => { t.pass() })`,
      `test.serial('my test', t => { t.pass() })`,
      `test.serial.only('my test', t => { t.pass() })`,
      `something.foo.foo('not a test')`,
    ],
    invalid: [
      {
        code: `test.serial.serial('my test', t => { t.pass() })`,
        errors: [{ message: /Duplicate modifier 'serial'/ }],
      },
      {
        code: `test.only.only('my test', t => { t.pass() })`,
        errors: [{ message: /Duplicate modifier 'only'/ }],
      },
    ],
  })
  t.pass()
})
