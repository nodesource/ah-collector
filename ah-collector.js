// eslint-disable-next-line camelcase
const async_hooks = require('async_hooks')
const util = require('util')
const defaultStackCapturer = require('ah-stack-capturer').turnedOff()

function no(hook, activity, resource) { return false }

class ActivityCollector {
  /**
   * Creates an instance of an ActivityCollector
   * @name ActivityCollector
   * @function
   * @param {Array.<Number>} start start time obtained via `process.hrtime()`
   * @param {StackCapturer} stackCapturer which is used to decide if a stack should be captured as well as to capture and process it
   *                        @see [thlorenz/ah-stack-capturer](https://github.com/thlorenz/ah-stack-capturer)
   *                        The default capturer used doesn't ever capture a stack so this feature is turned off by default.
   */
  constructor({
      start
    , captureResource = no
    , stackCapturer = defaultStackCapturer
  }) {
    this._start = start
    this._activities = new Map()
    this._stackCapturer = stackCapturer
    this._captureResource = captureResource

    this._asyncHook = async_hooks.createHook({
        init    : this._init.bind(this)
      , before  : this._before.bind(this)
      , after   : this._after.bind(this)
      , destroy : this._destroy.bind(this)
    })
  }

  /**
   * Enables the collection of async hooks.
   * **Needs to be called** as otherwise nothing will be collected.
   *
   * @name activityCollector.enable
   * @function
   * @return {ActivityCollector} activityCollector
   */
  enable() {
    this._asyncHook.enable()
    return this
  }

  /**
   * Disables the collection of async hooks.
   * Nothing will be collected until `activityCollector.enable()` is called.
   *
   * @name activityCollector.disable
   * @function
   * @return {ActivityCollector} activityCollector
   */
  disable() {
    this._asyncHook.disable()
    return this
  }

  /**
   * Clears all currently collected activity.
   *
   * @name activityCollector.clear
   * @function
   * @return {ActivityCollector} activityCollector
   */
  clear() {
    this._activities = new Map()
    return this
  }

  /**
   * Returns an Array of all activities collected so far that are of the specified type(s).
   *
   * @name activityCollector.activitiesOfTypes
   * @function
   * @param {Array.<String>|String} type the type to match
   * @return {Array} activities matching the specified type(s)
   */
  activitiesOfTypes(types) {
    if (!Array.isArray(types)) types = [ types ]
    return this.activitiesArray.filter((x) => types.indexOf(x.type) >= 0)
  }

  /**
   * A `getter` that returns a map of all activities collected so far.
   *
   * @name activityCollector.activities
   * @function
   * @return {Map} activities
   */
  get activities() {
    // prevent users from adding/removing activities
    // however the activity references are shared, so those
    // keep in mind to not modify these
    return new Map(this._activities)
  }

  /**
   * A `getter` that returns an Array  of all activities collected so far.
   *
   * @name activityCollector.activitiesArray
   * @function
   * @return {Array} activities
   */
  get activitiesArray() {
    return Array.from(this._activities.values())
  }

  _stamp(h, hook) {
    if (h == null) return
    if (h[hook] == null) h[hook] = []
    const time = process.hrtime(this._start)
    h[hook].push((time[0] * 1e9) + time[1])
  }

  _getActivity(id, hook) {
    const h = this._activities.get(id)
    if (!h) {
      const stub = { id, type: 'Unknown' }
      this._activities.set(id, stub)
      return stub
    }
    return h
  }

  _init(id, type, triggerId, resource) {
    const activity = { id, type, triggerId }
    this._stamp(activity, 'init')
    this._activities.set(id, activity)
    if (this._stackCapturer.shouldCaptureStack('init', activity.type)) {
      activity.initStack = this._stackCapturer.captureStack()
    }
  }

  _before(id) {
    const h = this._getActivity(id, 'before')
    this._stamp(h, 'before')
    if (this._stackCapturer.shouldCaptureStack('before', h.type)) {
      if (h.beforeStacks == null) h.beforeStacks = []
      h.beforeStacks.push(this._stackCapturer.captureStack())
    }
  }

  _after(id) {
    const h = this._getActivity(id, 'after')
    this._stamp(h, 'after')
    if (this._stackCapturer.shouldCaptureStack('after', h.type)) {
      if (h.afterStacks == null) h.afterStacks = []
      h.afterStacks.push(this._stackCapturer.captureStack())
    }
  }

  _destroy(id) {
    const h = this._getActivity(id, 'destroy')
    this._stamp(h, 'destroy')
    if (this._stackCapturer.shouldCaptureStack('destroy', h.type)) {
      h.destroyStack = this._stackCapturer.captureStack()
    }
  }

  /**
   * Processes all stacks that were captured for specific activities
   * This is done in line, i.e. the actual stacks of the activity objects
   * are modified.
   *
   * @name activityCollector.processStacks
   * @function
   * @return {ActivityCollector} activityCollector
   */
  processStacks() {
    // we don't process stacks when they are takend for performance reasons
    for (const activity of this.activities.values()) {
      if (activity.initStack != null) {
        activity.initStack = this._stackCapturer.processStack(activity.initStack)
      }
      if (activity.beforeStacks != null) {
        activity.beforeStacks = activity.beforeStacks.map(this._stackCapturer.processStack)
      }
      if (activity.afterStacks != null) {
        activity.afterStacks = activity.afterStacks.map(this._stackCapturer.processStack)
      }
      if (activity.destroyStack != null) {
        activity.destroyStack = this._stackCapturer.processStack(activity.destroyStack)
      }
    }
    return this
  }

  /**
   * Dumps all so far collected activities to the console.
   * This is useful for diagnostic purposes.
   *
   * If no arguments are provided, all activities are dumped.
   *
   * @name activityCollector.dump
   * @function
   * @param {Object} opts allow tweaking which activities are dumped and how
   * @param {Array.<String>|String} opts.types type(s) to dump
   * @param {String} opts.stage the stage to print as the title of the dump
   * @param {Number} opts.depth the depth with which the dumped object is dumped
   * @return {ActivityCollector} activityCollector
   */
  dump(opts = {}) {
    if (typeof opts === 'string') opts = { types: opts }
    const { types = null, depth = 5, stage = null } = opts
    const activities = types == null
      ? Array.from(this._activities.values())
      : this.activitiesOfTypes(types)

    if (stage != null) console.log('\n%s', stage)
    console.log(util.inspect(activities, false, depth, true))
    return this
  }
}

module.exports = ActivityCollector
