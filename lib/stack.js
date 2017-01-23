const asyncHooksRx = /\(async_hooks.js/

exports.captureStack = function captureStack() {
  var stack = {}
  Error.captureStackTrace(stack, captureStack)
  return stack.stack
}

exports.processStack = function processStack(stack) {
  // was it already processed?
  if (Array.isArray(stack)) return stack
  // remove first line (Error) and then find last mention of async_hooks
  // return all lines after that
  const lines = stack.split('\n').slice(1).map(x => x.trim())
  let i = 0
  // find first occurence
  while (!asyncHooksRx.test(lines[i])) i++
  // read past last occurence
  while (asyncHooksRx.test(lines[i])) i++

  // don't convert back to string in case the consumer wants
  // to do more with the stack lines
  return lines.slice(i)
}
