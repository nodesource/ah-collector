const test = require('tape')
const ActivityCollector = require('../')

// eslint-disable-next-line no-unused-vars
function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true))
}

test('\nsettings require init: one timeout that initialized before we enabled hooks', function(t) {
  setTimeout(check, 100)

  const collector = new ActivityCollector({ start: process.hrtime(), requireInit: true })
    .enable()

  function check() {
    collector.disable()
    const timeouts = collector.activitiesOfTypes('Timeout')
    const timers = collector.activitiesOfTypes('TIMERWRAP')
    const unknowns = collector.activitiesOfTypes(ActivityCollector.UNKNOWN_TYPE)

    t.equal(timeouts.length, 0, 'does not record any Timeout')
    t.equal(timers.length, 0, 'does not record any TIMERWRAP')
    t.equal(unknowns.length, 0, 'does not record any Unknowns')

    t.end()
  }
})
