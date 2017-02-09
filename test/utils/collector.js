const ActivityCollector = require('../../')

let collector = new ActivityCollector({ start: process.hrtime() })

exports.collector = collector

exports.init = function init() {
  return collector
    .disable()
    .clear()
    .enable()
}
