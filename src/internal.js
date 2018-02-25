
'use strict'

const { isArray } = Array

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
    // make sure the `resolver` and/or the `rejecter`
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
 * @param {Promise} next
 * @param {Function} [onFulfilled]
 * @param {Function} [onRejected]
 * @returns {Promise}
 * @public
 */
function nest (promise, next, onFulfilled, onRejected) {
  // next._parent = promise
  next._onRejected = onRejected
  next._onFulfilled = onFulfilled

  // pending
  if (!promise._state) {
    // register the next promise to notify later
    if (!promise._next) {
      promise._next = next
    }
    else if (isArray(promise._next)) {
      promise._next.push(next)
    }
    else {
      promise._next = [promise._next, next]
    }
  }

  // settled
  else {
    _notifyAsync(promise, next)
  }

  return next
}

/**
 * Resolve the given promise
 * 
 * @param {Promise} promise
 * @param {Any} value
 * @private
 */
function _resolve (promise, value) {
  // if (promise === value) {
  //   let msg = 'A promise cannot be resolved with itself.'

  //   return _reject(promise, new TypeError(msg))
  // }

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

  // notify next
  if (promise._next) {
    _notifyAsync(promise, promise._next)
    promise._next = null
  }
}

/**
 * Asynchonously notify the listeners
 * 
 * @param {Promise} promise
 * @param {Promise|Array<Promise>} receiver
 * @private
 */
function _notifyAsync (promise, receiver) {
  // mutilple receivers
  if (isArray(receiver)) {
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
