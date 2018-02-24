
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
    _assertFunction(fn)
    internal.execute(this, fn)
  }

  /**
   * 
   * 
   * @param {Function} executor
   * @returns {Promise}
   * @static
   */
  static from (executor) {
    return new Promise(executor)
  }

  /**
   * Creates a new resolved promise
   * 
   * @param {Any} [value]
   * @returns {Promise}
   * @static
   */
  static resolve (value) {
    return this.from((resolve) => resolve(value))
  }

  /**
   * Creates a new rejected promise for the provided reason
   * 
   * @param {Error} reason
   * @returns {Promise}
   * @static
   */
  static reject (reason) {
    return this.from((_, reject) => reject(reason))
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
    return this.from((resolve) => setTimeout(resolve, ms))
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
    onRejected && _assertFunction(onRejected)
    onFulfilled && _assertFunction(onFulfilled)

    if (!onFulfilled && !onRejected) {
      throw new TypeError('At least one callback is required.')
    }

    return internal.nest(this, Promise.from(internal.NOOP), onFulfilled, onRejected)
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
    _assertFunction(onRejected)

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
 * Assert the given argument is a function
 * 
 * @param {Any} argument
 * @throws {TypeError}
 * @private
 */
function _assertFunction (argument) {
  if (typeof value !== 'function') {
    throw new TypeError(`Expect function but ${typeof argument} given.`)
  }
}
