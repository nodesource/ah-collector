const ActivityCollector = require('../ah-collector')

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
