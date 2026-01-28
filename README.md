# @humaans/oxlint-plugin-ava

Oxlint plugin for the [AVA](https://github.com/avajs/ava) test framework.

## Installation

```sh
npm install -D @humaans/oxlint-plugin-ava
# or
pnpm add -D @humaans/oxlint-plugin-ava
# or
yarn add -D @humaans/oxlint-plugin-ava
# or
bun add -D @humaans/oxlint-plugin-ava
```

## Usage

Add the plugin to your `.oxlintrc.json`:

```json
{
  "plugins": ["@humaans/oxlint-plugin-ava"],
  "rules": {
    "ava/no-only-test": "error",
    "ava/no-skip-assert": "error",
    "ava/no-nested-tests": "error",
    "ava/no-duplicate-modifiers": "error",
    "ava/no-unknown-modifiers": "error",
    "ava/no-todo-implementation": "error",
    "ava/use-t-throws-async-well": "error"
  }
}
```

## Rules

| Rule                      | Description                                   |
| ------------------------- | --------------------------------------------- |
| `no-only-test`            | Disallow `test.only()` in committed code      |
| `no-skip-assert`          | Disallow `t.skip` assertion modifier          |
| `no-nested-tests`         | Disallow nested tests (not supported by AVA)  |
| `no-duplicate-modifiers`  | Disallow duplicate test modifiers             |
| `no-unknown-modifiers`    | Disallow unknown test modifiers               |
| `no-todo-implementation`  | Disallow `test.todo()` with an implementation |
| `use-t-throws-async-well` | Enforce `t.throwsAsync()` in async tests      |

## License

MIT
