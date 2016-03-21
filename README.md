# js-mutation-testing
Mutation test library for Javascript

This library is still under construction. It is designed to expose and improve the core mutation functionality of [grunt-mutation-testing](https://www.npmjs.com/package/grunt-mutation-testing)

### Design

[Class diagram](https://www.gliffy.com/go/publish/8133337)

### Contribute

There are still quite a few issues open before this project can be released. If you would like to contribute please feel
 free to look at the issue list on [Trello](https://trello.com/b/rNDtD8NK/js-mutation-test). This list is not not exhaustive. I'm assuming that more issues will be added. Issues with no members to their name are up for grabs.

If you want to take up an issue and you're not a member of the js-mutation-test team on Trello, send an email to paysdoc@gmail.com and ask to be added.
If you are a member, add yourself to a task (please remember that to avoid duplicate work), fork the project and get creative. :)

When you've completed a task / fixed a bug, create a pull request and we'll look at it and merge the code - or get back to you if we have questions or comments.
We'll post some coding guidelines here shortly


### Options

##### options.mutate
**Required**
Type: `String` or `[String]`

List of source code files that should be mutation tested.

##### options.test
**Required**
Type: `String` or `Function`

This test is executed for every Mutation. If it passes, this mutation is reported as 'survived'.

##### options.ignore
_optional_
Type: `String` or `RegExp` or `[String and/or RegExp]`
Default: `/('use strict'|"use strict");/`

Code that matches with any of the supplied regular expressions will not be mutated in any way.

Note that, by default, mutations on the strict mode keyword `'use strict'` will be ignored. If you really do want to mutate it, this can be done by providing the `options.discardDefaultIgnore` option (see below).

##### options.ignoreReplacements
_optional_
Type: `String` or `RegExp` or `[String and/or RegExp]`

Mutation replacements that match with any of the supplied regular expressions will not be introduced.

##### options.excludeMutations
_optional_
Type: `Object`

A set of properties, indicating whether certain mutations should be excluded for all files. See below for a list of available mutations.

##### options.mutateProductionCode
_optional_
Type: `Boolean`
Default: `false`

When true, code is not copied to a temporary directory and mutated there, but instead the original production code is mutated, which can speed up your tests.

_Be careful when using this option_, as, in case the mutation process does not exit correctly, your code will be left mutated.

##### options.discardDefaultIgnore
_optional_
Type: `Boolean`
Default: `false`

When true, mutations that are ignored by default (see `options.ignore`, above) will no longer be ignored.

We do not really see any relevant use case for this, but did not want to make it impossible to perform certain mutations either. Hence the existence of this configuration option.

#### Reporting options

##### options.logLevel
_optional_
Type: `String`
Default: `INFO`

The used log level. Available options: `ALL`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, `OFF`.

##### options.reporters
_optional_
Type: `Object`
Default: `{ console: true }`

Configuration of reporters to use. Available options: `console`, `text`, `html`.

##### options.reporters.text.dir
_optional_
Type: `String`
Default: `"reports/grunt-mutation-testing"`

Directory to place the text report in.

##### options.reporters.text.file
_optional_
Type: `String`
Default: `grunt-mutation-testing.txt`

Filename of the text report.

##### options.reporters.html.dir
_optional_
Type: `String`
Default: `"reports/grunt-mutation-testing"`

Directory to place the HTML report in.

##### options.reporters.html.successThreshold
_optional_
Type: `Number`
Default: `80`

Percentage of mutations that should be killed in order for a test result to be considered successful.

##### options.maxReportedMutationLength
_optional_
Type: `Number`
Default: 80

The maximum reported length of the mutation that has been done. When set to `0`, the full mutation is logged regardless of its length.

### Usage Examples
```to be added later```

## Available mutations
Currently, the following mutations are available:

| Mutation code        | Description                                                   | Example                                                                       |
|----------------------|---------------------------------------------------------------|-------------------------------------------------------------------------------|
| `MATH`               | Replace arithmetic operators by their opposites               | `1 + 1` to `1 - 1`                                                            |
| `ARRAY`              | Remove elements from an array                                 | `[1,2,3]` to `[1,3]`                                                          |
| `BLOCK_STATEMENT`    | Remove statements from a block of statements                  | `function foo(x) { x = x * 2; return x; }` to `function foo(x) { return x; }` |
| `METHOD_CALL`        | Mutate parameters of a function call                          | `foo(x)` to `x`                                                               |
| `COMPARISON`         | Replace operators by their boundary and negation counterparts | `x < 10` to `x <= 10`                                                         |
| `LITERAL`            | Replace strings, increment numbers, and negate booleans       | `var x = 'Hello'` to `var x = '"MUTATION!"'`                                  |
| `LOGICAL_EXPRESSION` | Replace logical operators by their opposites                  | `x && y` to `x || y`                                                          |
| `OBJECT`             | Remove object properties                                      | `{a: 10, b: 'B'}` to `{b: 'B'}`                                               |
| `UNARY_EXPRESSION`   | Negate unary expressions                                      | `var x = -42` to `var x = 42`                                                 |
| `UPDATE_EXPRESSION`  | Negate update expressions                                     | `x++` to `x--`                                                                |

## Excluding mutations
Since not all mutations may be relevant for your project, it is possible to configure which mutations should be performed and which should not.

### Global exclusions
In order to completely disable a specific mutation, one can provide the excludeMutations configuration option. This takes an object where the keys represent the mutations and the values denote whether the mutation should in fact be excluded. For example:
```js
{
  mutationTest: {
    options: {
      excludeMutations: {
        'MATH': true,
        'LITERAL': false,
        'OBJECT': true
      }
    },
    // ...
  }
}
```
would disable the `MATH` and `OBJECT` mutations, while the `LITERAL` mutations are still active.

### Local exclusions
In some cases, more fine-tuning is needed for which mutations should be excluded where. It is possible to disable mutations _on block level_ by prepending the code with a comment containing the `@excludeMutations` keyword.

When only the `@excludeMutations` comment is provided, _all_ mutations will be excluded for the block above which that comment is placed. It is also possible to provide an array of specific mutations that should be excluded, e.g.:
```js
function foo() {
  // ...
}

/**
 * @excludeMutations ['MATH', 'OBJECT']
 */
function bar() {
  // ...
}
```
would disable the `MATH` and `OBJECT` mutations on the `bar` method and its contents, but not on `foo`.

All javascript comment types are supported, i.e. one can use both `// @excludeMutations` _and_ `/* @excludeMutations ["ARRAY"] */`. These comments can also be placed in the middle of a line of code, object, or function call, to allow for very specific configuration.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Gulp](http://gulpjs.com/).
