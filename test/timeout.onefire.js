const test = require('tape')
const { oneTimeout } = require('./utils/common-checks')
const { collector, init } = require('./utils/collector')

test('\none timeout that fired', function(t) {
  init()

  setTimeout(check, 100)
  function check() {
    oneTimeout(t, collector)

    const timeouts = collector.activitiesOfTypes('Timeout')
    const timers = collector.activitiesOfTypes('TIMERWRAP')
    const timeout = timeouts[0]
    const timer = timers[0]

    t.ok(Array.isArray(timeout.before), 'timeout has before')
    t.equal(timeout.before.length, 1, 'timeout has one before')

    t.ok(Array.isArray(timer.before), 'timer has before')
    t.equal(timer.before.length, 1, 'timer has one before')

    t.ok(!Array.isArray(timeout.after), 'timeout has no after')
    t.ok(!Array.isArray(timeout.destroy), 'timeout has no destroy')
    t.ok(!Array.isArray(timer.after), 'timer has no after')
    t.ok(!Array.isArray(timer.destroy), 'timer has no destroy')

    t.end()
  }
})
