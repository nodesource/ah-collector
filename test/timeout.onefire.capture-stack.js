const test = require('tape')
const { oneTimeout } = require('./utils/common-checks')
const ActivityCollector = require('../ah-collector')
const StackCapturer = require('ah-stack-capturer')

function shouldCapture(event, type) {
  // capture only inits of the TIMERWRAP but everything of the Timeout
  return type === 'Timeout' || (type === 'TIMERWRAP' && event === 'init')
}
const stackCapturer = new StackCapturer({ shouldCapture })

const collector = new ActivityCollector({
    start: process.hrtime()
  , stackCapturer
}).enable()

process.on('exit', onexit)

test('\none timeout that fired, captureStack and stack processing', function(t) {
  setTimeout(check, 100)
  function check() {
    oneTimeout(t, collector)

    const timers = collector.activitiesOfTypes('TIMERWRAP')
    const timeouts = collector.activitiesOfTypes('Timeout')
    const timer = timers[0]
    const timeout = timeouts[0]

    // timer only has an init stack
    t.equal(typeof timer.initStack, 'string', 'timer has a string init stack')
    t.ok(!Array.isArray(timer.beforeStacks), 'timer has no before stack')
    t.ok(!Array.isArray(timer.afterStacks), 'timer has no after stack')
    t.equal(typeof timer.destroyStack, 'undefined', 'timer has no destroy stack')

    // timeout has an init and one before stack
    t.equal(typeof timeout.initStack, 'string', 'timeout has a string init stack')
    t.ok(Array.isArray(timeout.beforeStacks), 'timeout has before stacks')
    t.equal(timeout.beforeStacks.length, 1, 'timeout has one before stack')
    t.equal(typeof timeout.beforeStacks[0], 'string', 'timeout before stack is a string')
    t.ok(!Array.isArray(timeout.afterStacks), 'timeout has no after stack')
    t.equal(typeof timeout.destroyStack, 'undefined', 'timeout has no destroy stack')

    t.end()
  }
})

// some checks have to be performed on exit
function onexit() {
  const t = require('assert')
  const timers = collector.activitiesOfTypes('TIMERWRAP')
  const timeouts = collector.activitiesOfTypes('Timeout')
  const timer = timers[0]
  const timeout = timeouts[0]

  // timer still only has an init stack
  t.equal(typeof timer.initStack, 'string', 'timer has a string init stack')
  t.ok(!Array.isArray(timer.beforeStacks), 'timer has no before stack')
  t.ok(!Array.isArray(timer.afterStacks), 'timer has no after stack')
  t.equal(typeof timer.destroyStack, 'undefined', 'timer has no destroy stack')

  // timeout has a stack for all hooks at this point
  t.equal(typeof timeout.initStack, 'string', 'timeout has a string init stack')

  t.ok(Array.isArray(timeout.beforeStacks), 'timeout has before stacks')
  t.equal(timeout.beforeStacks.length, 1, 'timeout has one before stack')
  t.equal(typeof timeout.beforeStacks[0], 'string', 'timeout before stack is a string')

  t.ok(Array.isArray(timeout.afterStacks), 'timeout has after stacks')
  t.equal(timeout.afterStacks.length, 1, 'timeout has one after stack')
  t.equal(typeof timeout.afterStacks[0], 'string', 'timeout after stack is a string')

  t.equal(typeof timeout.destroyStack, 'string', 'timeout has a string destroy stack')

  // after we process the stacks, all of them should be arrays of stack lines
  collector.processStacks()
  t.ok(Array.isArray(timer.initStack), 'timer init stack is processed to array')

  t.ok(Array.isArray(timeout.initStack), 'timeout init stack is processed to array')

  t.equal(timeout.beforeStacks.length, 1, 'timeout still has one before stack')
  t.ok(Array.isArray(timeout.beforeStacks[0]), 'timeout before stack is processed to array')

  t.equal(timeout.afterStacks.length, 1, 'timeout still has one after stack')
  t.ok(Array.isArray(timeout.afterStacks[0]), 'timeout after stack is processed to array')

  t.ok(Array.isArray(timeout.destroyStack), 'timeout destroy stack is processed to array')
}
