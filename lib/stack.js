exports.captureStack = function captureStack() {
  var stack = {}
  Error.captureStackTrace(stack, captureStack)
  return stack.stack
}

exports.processStack = function processStack(stack) {
  // was it already processed?
  if (Array.isArray(stack)) return stack
  // split into lines and remove first 3
  // we can improve on this later if it's not quite that simple
  const lines = stack.split('\n')

  // don't convert back to string in case the consumer wants
  // to do more with the stack lines
  return lines.slice(4).map(x => x.trim())
}
