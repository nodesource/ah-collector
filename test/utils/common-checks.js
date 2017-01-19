exports.oneTimeout = function oneTimeout(t, collector) {
  t.ok(collector.activities.size >= 2, 'at least 2 activities')
  t.equal(collector.activitiesOfTypes([ 'Timeout', 'TIMERWRAP' ]).length, 2
    , 'activitiesOfTypes for 2 types')

  const timeouts = collector.activitiesOfTypes('Timeout')
  const timers = collector.activitiesOfTypes('TIMERWRAP')
  t.equal(timeouts.length, 1, 'activitiesOfTypes for 1 "Timeout"')
  t.equal(timers.length, 1, 'activitiesOfTypes for 1 "TIMERWRAP"')

  const timeout = timeouts[0]
  const timer = timers[0]

  t.ok(Array.isArray(timeout.init), 'timeout has init')
  t.equal(timeout.init.length, 1, 'timeout has one init')

  t.ok(Array.isArray(timer.init), 'timer has init')
  t.equal(timer.init.length, 1, 'timer has one init')

  t.equal(typeof timer.uid, 'number', 'timer has number uid')
  t.equal(typeof timer.triggerId, 'number', 'timer has number triggerId')
  t.equal(timer.type, 'TIMERWRAP', 'timer has TIMERWRAP type')

  t.equal(typeof timeout.uid, 'number', 'timeout has number uid')
  t.equal(typeof timeout.triggerId, 'number', 'timeout has number triggerId')
  t.equal(timeout.type, 'Timeout', 'timeout has Timeout type')
}
