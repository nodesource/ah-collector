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

```
/**
  * Creates an instance of an ActivityCollector
  * @name ActivityCollector
  * @function
  * @param {Array.<Number>} start start time obtained via `process.hrtime()`
   * @param {StackCapturer} stackCapturer which is used to decide if a stack should be captured as well as to capture and process it
   *                        @see [thlorenz/ah-stack-capturer](https://github.com/thlorenz/ah-stack-capturer)
   *                        The default capturer used doesn't ever capture a stack so this feature is turned off by default.
  */

/**
  * Enables the collection of async hooks.
  * **Needs to be called** as otherwise nothing will be collected.
  *
  * @name activityCollector.enable
  * @function
  * @return {ActivityCollector} activityCollector
  */

/**
  * Disables the collection of async hooks.
  * Nothing will be collected until `activityCollector.enable()` is called.
  *
  * @name activityCollector.disable
  * @function
  * @return {ActivityCollector} activityCollector
  */

/**
  * Clears all currently collected activity.
  *
  * @name activityCollector.clear
  * @function
  * @return {ActivityCollector} activityCollector
  */

/**
  * Returns an Array of all activities collected so far that are of the specified type(s).
  *
  * @name activityCollector.activitiesOfTypes
  * @function
  * @param {Array.<String>|String} type the type to match
  * @return {Array} activities matching the specified type(s)
  */

/**
  * A `getter` that returns a map of all activities collected so far.
  *
  * @name activityCollector.activities
  * @function
  * @return {Map} activities
  */

/**
  * A `getter` that returns an Array  of all activities collected so far.
  *
  * @name activityCollector.activitiesArray
  * @function
  * @return {Array} activities
  */

/**
  * Processes all stacks that were captured for specific activities
  * This is done in line, i.e. the actual stacks of the activity objects
  * are modified.
  *
  * @name activityCollector.processStacks
  * @function
  * @return {ActivityCollector} activityCollector
  */

/**
  * Dumps all so far collected activities to the console.
  * This is useful for diagnostic purposes.
  *
  * If no arguments are provided, all activities are dumped.
  *
  * @name activityCollector.dump
  * @function
  * @param {Object} opts allow tweaking which activities are dumped and how
  * @param {Array.<String>|String} opts.types type(s) to dump
  * @param {String} opts.stage the stage to print as the title of the dump
  * @param {Number} opts.depth the depth with which the dumped object is dumped
  * @return {ActivityCollector} activityCollector
  */
```

## License

MIT
