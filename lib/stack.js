exports.captureStack = function captureStack() {
  var stack = {}
  Error.captureStackTrace(stack, captureStack)
  return stack.stack
}

exports.cleanStack = function cleanStack(stack) {
  const lines = stack.split('\n')
  return lines.slice(3)
}
