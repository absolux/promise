
'use strict'

const internal = require('./internal')

// export
module.exports = class Promise {
  /**
   * Initialize a new Promise instance
   * 
   * @param {Function} fn
   * @constructor
   */
  constructor (fn) {
    if (!_isFunction(fn)) {
      throw new TypeError(`Expect function but ${typeof fn} given.`)
    }

    internal.execute(this, fn)
  }

  /**
   * Creates a new resolved promise
   * 
   * @param {Any} [value]
   * @returns {Promise}
   * @static
   */
  static resolve (value) {
    if (value instanceof Promise) return value

    return new Promise((resolve) => resolve(value))
  }

  /**
   * Creates a new rejected promise for the provided reason
   * 
   * @param {Error} reason
   * @returns {Promise}
   * @static
   */
  static reject (reason) {
    return new Promise((_, reject) => reject(reason))
  }

  /**
   * Creates a Promise that is resolved with an array of results when all of 
   * the provided Promises resolve, or rejected when any Promise is rejected
   * 
   * @param {Array<Any>} arr
   * @returns {Promise}
   * @static
   */
  static all (arr) {
    throw new Error('Not yet implemented.')
  }

  /**
   * Creates a Promise that is resolved or rejected when
   * any of the provided Promises are resolved or rejected
   * 
   * @param {Array<Promise>} arr
   * @returns {Promise}
   * @static
   */
  static race (arr) {
    throw new Error('Not yet implemented.')
  }

  /**
   * Returns a promise which will resolve after a milliseconds delay
   * 
   * @param {Number} ms
   * @returns {Promise}
   * @static
   */
  static delay (ms) {
    // return new Promise((resolve) => setTimeout(resolve, ms))
    throw new Error('Not yet implemented.')
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise
   * 
   * @param {Function} onFulfilled
   * @param {Function} [onRejected]
   * @returns {Promise}
   * @throws {TypeError}
   * @public
   */
  then (onFulfilled, onRejected = null) {
    // ignore callbacks
    if (!_isFunction(onRejected)) onRejected = null
    if (!_isFunction(onFulfilled)) onFulfilled = null

    return internal.nest(this, new Promise(internal.NOOP), onFulfilled, onRejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise
   * 
   * @param {Function} onRejected
   * @returns {Promise}
   * @throws {TypeError}
   * @public
   */
  catch (onRejected) {
    return this.then(null, onRejected)
  }

  /**
   * Returns a string representation of a promise
   * 
   * @returns {String}
   */
  toString () {
    return '[object Promise]'
  }
}

/**
 * returns true the given argument is a function, false otherwise
 * 
 * @param {Any} arg
 * @returns {Boolean}
 * @private
 */
function _isFunction (arg) {
  return typeof arg === 'function'
}
