# ah-collector

Super light wrapper around async-hooks to collect information about resources created during async operations.

```js
const ActivityCollector = require('ah-collector')

function captureStack(hook, { uid, type, triggerId }, resource) {
  // Predicate to decide if a stack should be captured or not.
  // Capture only inits of the TIMERWRAP but everything of the Timeout.
  return type === 'Timeout' || (type === 'TIMERWRAP' && hook === 'init')
}

const collector = new ActivityCollector({
    start: process.hrtime()
  , captureStack
}).enable()

setTimeout(ontimeout, 100)

function ontimeout() {
  collector
    .processStacks()
    .dump()
}
```

## Requirements

Needs async hooks feature, therefore build from [this PR](https://github.com/nodejs/node/pull/8531) for now.

[EPS document](https://github.com/nodejs/node-eps/pull/18)

[Documentation in
progress](https://github.com/thlorenz/node/blob/trevnorris-async-wrap-eps-impl%2Bdocs/doc/api/async_hooks.md)

## Installation

    npm install ah-collector

## API

## License

MIT
