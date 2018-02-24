
/**
 * @type {Function}
 */
const NOOP = () => {}

/**
 * @type {Number}
 */
const PENDING = 0

/**
 * @type {Number}
 */
const REJECTED = 1

/**
 * @type {Number}
 */
const FULFILLED = 2

/**
 * Invoke synchronously the executor
 * 
 * @param {Promise} promise
 * @param {Function} fn
 * @public
 */
function execute (promise, fn) {
  if (fn !== NOOP) {
    // make sure the `resolver` and  the `rejecter`
    // are only called once
    let called = false

    try {
      fn(
        // resolver
        (result) => {
          if (!called) {
            called = true
            _resolve(promise, result)
          }
        },

        // rejecter
        (error) => {
          if (!called) {
            called = true
            _reject(promise, error)
          }
        }
      )
    }
    catch (error) {
      if (!called) {
        called = true
        _reject(promise, error)
      }
    }
  }
}

/**
 * 
 * 
 * @param {Promise} promise
 * @param {Promise} receiver
 * @param {Function} [onFulfilled]
 * @param {Function} [onRejected]
 * @returns {Promise}
 * @public
 */
function nest (promise, receiver, onFulfilled, onRejected) {
  receiver._parent = promise
  receiver._onRejected = onRejected
  receiver._onFulfilled = onFulfilled

  // pending
  if (!source._state) {
    if (!promise._receiver) {
      promise._receiver = receiver
    }
    else if (Array.isArray(promise._receiver)) {
      promise._receiver.push(receiver)
    }
    else {
      promise._receiver = [promise._receiver, receiver]
    }

    return
  }
  else {
    // settled
    _notifyAsync(promise, receiver)
  }

  return receiver
}

/**
 * Resolve the given promise
 * 
 * @param {Promise} promise
 * @param {Any} value
 * @private
 */
function _resolve (promise, value) {
  // plain value
  if (!value || !value.then) {
    return _settle(promise, FULFILLED, value)
  }

  // thenable
  value.then(
    (result) => _resolve(promise, result),
    (error) => _reject(promise, error)
  )
}

/**
 * Reject the given promise
 * 
 * @param {Promise} promise
 * @param {Any} value
 * @private
 */
function _reject (promise, value) {
  _settle(promise, REJECTED, value)
}

/**
 * Set the state and value of a promise
 * 
 * @param {Promise} promise
 * @param {Number} state
 * @param {Any} value
 * @private
 */
function _settle (promise, state, value) {
  promise._state = state
  promise._value = value

  // notify children
  if (promise._receiver) {
    _notifyAsync(promise, promise._receiver)
    promise._receiver = null
  }
}

/**
 * Asynchonously notify the listeners
 * 
 * @param {Promise} promise
 * @param {Promise|Array<Promise>} receiver
 * @private
 */
function _notifyAsync (fn, promise, receiver) {
  // mutilple receivers
  if (Array.isArray(receiver)) {
    for (let i = 0; i < receiver.length; i++) {
      setImmediate(_notify, promise, receiver[i])
    }

    return
  }

  setImmediate(_notify, promise, receiver)
}

/**
 * Notify the given value receiver
 * 
 * @param {Promise} promise
 * @param {Promise} receiver
 * @private
 */
function _notify (promise, receiver) {
  var fn = promise._state === FULFILLED ? receiver._onFulfilled : receiver._onRejected

  if (!fn) {
    if (promise._state === FULFILLED) {
      _resolve(receiver, promise._value)
    }
    else {
      _reject(receiver, promise._value)
    }
    return
  }

  try {
    var result = fn(promise._value)

    _resolve(receiver, result)
  }
  catch (error) {
    _reject(receiver, error)
  }
}

// exports
module.exports = {
  execute,
  nest,
  NOOP
}
