const test = require('tape')
const { oneTimeout } = require('./utils/common-checks')
const { collector, init } = require('./utils/collector')

function noop() {}

test('\none timeout that never fired, checking activities + activitiesOfTypes', function(t) {
  init()

  const timeoutToken = setTimeout(noop, 100)
  clearTimeout(timeoutToken)

  oneTimeout(t, collector)

  const timeouts = collector.activitiesOfTypes('Timeout')
  const timers = collector.activitiesOfTypes('TIMERWRAP')
  const timeout = timeouts[0]
  const timer = timers[0]

  t.ok(!Array.isArray(timeout.before), 'timeout has no before')
  t.ok(!Array.isArray(timeout.after), 'timeout has no after')
  t.ok(!Array.isArray(timeout.destroy), 'timeout has no destroy')
  t.ok(!Array.isArray(timer.before), 'timer has no before')
  t.ok(!Array.isArray(timer.after), 'timer has no after')
  t.ok(!Array.isArray(timer.destroy), 'timer has no destroy')

  t.end()
})
