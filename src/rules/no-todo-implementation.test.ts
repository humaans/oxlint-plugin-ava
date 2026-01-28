import test from 'ava'
import { RuleTester } from 'oxlint'
import { noTodoImplementation } from './no-todo-implementation.ts'

const ruleTester = new RuleTester()

test('no-todo-implementation', t => {
  ruleTester.run('no-todo-implementation', noTodoImplementation, {
    valid: [
      `test.todo('my future test')`,
      `test('my test', t => { t.pass() })`,
    ],
    invalid: [
      {
        code: `test.todo('my test', t => { t.pass() })`,
        errors: [{ message: /should not have an implementation/ }],
      },
      {
        code: `test.todo('my test', () => {})`,
        errors: [{ message: /should not have an implementation/ }],
      },
    ],
  })
  t.pass()
})
