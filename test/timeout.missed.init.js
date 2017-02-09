const test = require('tape')
const { init } = require('./utils/collector')
const ActivityCollector = require('../')

// eslint-disable-next-line no-unused-vars
function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true))
}

test('\ndefault settings: one timeout that initialized before we enabled hooks', function(t) {
  setTimeout(check, 100)

  const collector = init()
  function check() {
    collector.disable()
    const timeouts = collector.activitiesOfTypes('Timeout')
    const timers = collector.activitiesOfTypes('TIMERWRAP')
    const unknowns = collector.activitiesOfTypes(ActivityCollector.UNKNOWN_TYPE)

    t.equal(timeouts.length, 0, 'does not record any Timeout')
    t.equal(timers.length, 0, 'does not record any TIMERWRAP')
    t.ok(unknowns.length >= 2, 'does record at least two Unknown types')

    unknowns.forEach(x => {
      t.equal(x.init, undefined, 'unknown has no init')
      t.ok(Array.isArray(x.before) ||
           Array.isArray(x.after) ||
           Array.isArray(x.destroy)
        , 'unknown has a before, after or destroy')
    })

    t.end()
  }
})
