const ActivityCollector = require('../../')

let collector = new ActivityCollector({ start: process.hrtime() })

exports.collector = collector

exports.init = function init() {
  collector
    .disable()
    .clear()
    .enable()
}
