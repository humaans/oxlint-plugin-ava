// src/rules/no-duplicate-modifiers.ts
var noDuplicateModifiers = {
  create(context) {
    return {
      CallExpression(node) {
        const modifiers = collectModifiers(node.callee);
        const seen = /* @__PURE__ */ new Set();
        for (const mod of modifiers) {
          if (seen.has(mod)) {
            context.report({
              message: `Duplicate modifier '${mod}' is not allowed`,
              node
            });
            break;
          }
          seen.add(mod);
        }
      }
    };
  }
};
function collectModifiers(node) {
  const modifiers = [];
  let current = node;
  while (current?.type === "MemberExpression") {
    const prop = current.property;
    if (prop.type === "Identifier") {
      modifiers.push(prop.name);
    }
    current = current.object;
  }
  if (current?.type === "Identifier" && current.name === "test") {
    return modifiers;
  }
  return [];
}

// src/rules/no-nested-tests.ts
var noNestedTests = {
  create(context) {
    let testDepth = 0;
    return {
      CallExpression(node) {
        if (isTestCall(node)) {
          if (testDepth > 0) {
            context.report({
              message: "Nested tests are not supported in AVA",
              node
            });
          }
          testDepth++;
        }
      },
      "CallExpression:exit"(node) {
        if (isTestCall(node)) {
          testDepth--;
        }
      }
    };
  }
};
function isTestCall(node) {
  let current = node.callee;
  while (current) {
    if (current.type === "Identifier" && current.name === "test") {
      return true;
    }
    if (current.type === "MemberExpression") {
      current = current.object;
    } else {
      break;
    }
  }
  return false;
}

// src/rules/no-only-test.ts
var noOnlyTest = {
  create(context) {
    return {
      CallExpression(node) {
        if (isTestModifierCall(node, "only")) {
          context.report({
            message: "test.only is not allowed in committed code",
            node
          });
        }
      }
    };
  }
};
function isTestModifierCall(node, modifier) {
  let current = node.callee;
  while (current) {
    if (current.type === "MemberExpression") {
      const prop = current.property;
      if (prop.type === "Identifier" && prop.name === modifier) {
        return hasTestRoot(current.object);
      }
      current = current.object;
    } else {
      break;
    }
  }
  return false;
}
function hasTestRoot(node) {
  if (!node) return false;
  if (node.type === "Identifier" && node.name === "test") return true;
  if (node.type === "MemberExpression") {
    return hasTestRoot(node.object);
  }
  return false;
}

// src/rules/no-skip-assert.ts
var noSkipAssert = {
  create(context) {
    return {
      CallExpression(node) {
        if (isTSkipCall(node)) {
          context.report({
            message: "t.skip assertions are not allowed",
            node
          });
        }
      }
    };
  }
};
function isTSkipCall(node) {
  const callee = node.callee;
  if (callee.type !== "MemberExpression") return false;
  const object = callee.object;
  if (object.type === "MemberExpression") {
    const innerObject = object.object;
    const innerProp = object.property;
    if (innerObject.type === "Identifier" && innerObject.name === "t" && innerProp.type === "Identifier" && innerProp.name === "skip") {
      return true;
    }
  }
  return false;
}

// src/rules/no-todo-implementation.ts
var noTodoImplementation = {
  create(context) {
    return {
      CallExpression(node) {
        if (isTestTodoCall(node) && hasImplementation(node)) {
          context.report({
            message: "test.todo() should not have an implementation",
            node
          });
        }
      }
    };
  }
};
function isTestTodoCall(node) {
  let current = node.callee;
  while (current) {
    if (current.type === "MemberExpression") {
      const prop = current.property;
      if (prop.type === "Identifier" && prop.name === "todo") {
        return hasTestRoot2(current.object);
      }
      current = current.object;
    } else {
      break;
    }
  }
  return false;
}
function hasTestRoot2(node) {
  if (!node) return false;
  if (node.type === "Identifier" && node.name === "test") return true;
  if (node.type === "MemberExpression") {
    return hasTestRoot2(node.object);
  }
  return false;
}
function hasImplementation(node) {
  const args = node.arguments;
  return args.some(
    (arg) => arg.type === "FunctionExpression" || arg.type === "ArrowFunctionExpression"
  );
}

// src/rules/no-unknown-modifiers.ts
var KNOWN_MODIFIERS = /* @__PURE__ */ new Set([
  "after",
  "afterAll",
  "afterEach",
  "always",
  "before",
  "beforeAll",
  "beforeEach",
  "cb",
  "failing",
  "macro",
  "only",
  "serial",
  "skip",
  "todo"
]);
var noUnknownModifiers = {
  create(context) {
    return {
      CallExpression(node) {
        const modifiers = collectModifiers2(node.callee);
        for (const mod of modifiers) {
          if (!KNOWN_MODIFIERS.has(mod)) {
            context.report({
              message: `Unknown modifier '${mod}' is not a valid AVA modifier`,
              node
            });
          }
        }
      }
    };
  }
};
function collectModifiers2(node) {
  const modifiers = [];
  let current = node;
  while (current?.type === "MemberExpression") {
    const prop = current.property;
    if (prop.type === "Identifier") {
      modifiers.push(prop.name);
    }
    current = current.object;
  }
  if (current?.type === "Identifier" && current.name === "test") {
    return modifiers;
  }
  return [];
}

// src/rules/use-t-throws-async-well.ts
var useTThrowsAsyncWell = {
  create(context) {
    const asyncTestStack = [];
    return {
      // Track when we enter an async test function
      CallExpression(node) {
        if (isTestCall2(node)) {
          const testFn = getTestFunction(node);
          asyncTestStack.push(testFn?.async === true);
        }
        const inAsyncTest = asyncTestStack.includes(true);
        if (inAsyncTest && isSyncThrowsCall(node)) {
          const methodName = getMethodName(node);
          context.report({
            message: `Use t.${methodName}Async() instead of t.${methodName}() in async tests`,
            node
          });
        }
      },
      "CallExpression:exit"(node) {
        if (isTestCall2(node) && asyncTestStack.length > 0) {
          asyncTestStack.pop();
        }
      }
    };
  }
};
function isTestCall2(node) {
  let current = node.callee;
  while (current) {
    if (current.type === "Identifier" && current.name === "test") {
      return true;
    }
    if (current.type === "MemberExpression") {
      current = current.object;
    } else {
      break;
    }
  }
  return false;
}
function getTestFunction(node) {
  const args = node.arguments;
  return args.find(
    (arg) => arg.type === "FunctionExpression" || arg.type === "ArrowFunctionExpression"
  );
}
function isSyncThrowsCall(node) {
  const callee = node.callee;
  if (callee.type !== "MemberExpression") return false;
  const object = callee.object;
  const prop = callee.property;
  if (object.type !== "Identifier" || object.name !== "t") return false;
  if (prop.type !== "Identifier") return false;
  return prop.name === "throws" || prop.name === "notThrows";
}
function getMethodName(node) {
  const callee = node.callee;
  if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
    return callee.property.name;
  }
  return "";
}

// src/index.ts
var plugin = {
  meta: { name: "ava" },
  rules: {
    "no-duplicate-modifiers": noDuplicateModifiers,
    "no-nested-tests": noNestedTests,
    "no-only-test": noOnlyTest,
    "no-skip-assert": noSkipAssert,
    "no-todo-implementation": noTodoImplementation,
    "no-unknown-modifiers": noUnknownModifiers,
    "use-t-throws-async-well": useTThrowsAsyncWell
  }
};
var index_default = plugin;
export {
  index_default as default
};
