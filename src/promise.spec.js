/* global describe, it */

'use strict'

const assert = require('assert')
const Promise = require('./promise')

let promise
const sentinel = {}

// sync plain promise
let a = Promise.resolve(true)

// promise value (will call then internally)
let b = Promise.resolve(a)

describe('Test Promise', () => {
  describe('new Promise(executor)', () => {
    beforeEach(() => {
      promise = new Promise((resolve) => resolve(sentinel))
    })

    it('has `Object.getPrototypeOf(promise) === Promise.prototype`', () => {
      assert(Object.getPrototypeOf(promise) === Promise.prototype)
    })

    it('has `promise.constructor === Promise`', () => {
      assert(promise.constructor === Promise)
    })

    it('has `promise.constructor === Promise.prototype.constructor`', () => {
      assert(promise.constructor === Promise.prototype.constructor)
    })

    it('has only one argument', () => {
      assert(Promise.length === 1)
    })

    describe('the executor is not a function', () => {
      it('must throw a `TypeError`', () => {
        try {
          new Promise({})
        } catch (ex) {
          assert(ex instanceof TypeError)
          return
        }
        assert.fail('Should have thrown a TypeError')
      })
    })

    describe('the executor is a function', () => {
      it('should be called with the `Promise` resolvers', (done) => {
        new Promise(function (resolve, reject) {
          assert(typeof resolve === 'function')
          assert(typeof reject === 'function')
          done()
        })
      })

      it('should be called immediately, before `Promise` returns', () => {
        var called = false

        new Promise(function (resolve, reject) {
          called = true
        })

        assert(called)
      })
    })

    describe('calling resolve(x) within the executor', () => {
      describe('when `x` is a simple value', () => {
        it('should equal the value', () => {
          assert.equal(promise._value, sentinel)
        })

        it('should be fulfilled with `x`', () => {
          assert.equal(promise._state, 2)
        })

        it('should call the onFulfillment callback', () => {
          promise.then((result) => {
            assert.equal(result, sentinel)
            done()
          })
        })

        it('is fulfilled with x as the fulfillment value', (done) => {
          promise.then(function (fulfillmentValue) {
            assert(fulfillmentValue === sentinel)
          })
          .then(done, function (err) {
            done(err || new Error('Promise rejected'))
          })
        })
      })
    })

    describe('Calling reject(x)', function () {
      describe('if promise is resolved', function () {
        it('nothing happens', function (done) {
          var thenable = {then: function (onComplete) {
            setTimeout(function () {
              onComplete(sentinel)
            }, 5)
          }}
          new Promise(function (resolve, reject) {
            setImmediate(function () {
              resolve(thenable)
              reject('foo')
            })
          })
          .then(function (result) {
            assert(result === sentinel)
          })
          .then(function () {
            done()
          }, function (err) {
            done(err || new Error('Promise rejected'))
          })
        })
      })

      describe('otherwise', function () {
        it('is rejected with x as the rejection reason', function (done) {
          new Promise(function (resolve, reject) {
            reject(sentinel)
          })
          .then(null, function (rejectionReason) {
            assert(rejectionReason === sentinel)
          })
          .then(function () {
            done()
          }, function (err) {
            done(err || new Error('Promise rejected'))
          })
        })
      })
    })

    describe('if executer throws', function () {
      describe('if promise is resolved', function () {
        it('nothing happens', function (done) {
          var thenable = {then: function (onComplete) {
            setTimeout(function () {
              onComplete(sentinel)
            }, 5)
          }};
          new Promise(function (resolve, reject) {
            resolve(thenable)
            throw new Error('foo');
          })
          .then(function (result) {
            assert(result === sentinel)
          })
          .then(function () {
            done()
          }, function (err) {
            done(err || new Error('Promise rejected'));
          })
        })
      })

      describe('otherwise', function () {
        it('is rejected with e as the rejection reason', function (done) {
          new Promise(function (resolve, reject) {
            throw sentinel
          })
          .then(null, function (rejectionReason) {
            assert(rejectionReason === sentinel)
          })
          .then(function () {
            done()
          }, function (err) {
            done(err || new Error('Promise rejected'));
          })
        })
      })
    })
  })
})

describe('nested promises', function () {
  it('does not result in any wierd behaviour - 1', function (done) {
    var resolveA, resolveB, resolveC
    var A = new Promise(function (resolve, reject) {
      resolveA = resolve
    })
    var B = new Promise(function (resolve, reject) {
      resolveB = resolve
    })
    var C = new Promise(function (resolve, reject) {
      resolveC = resolve
    })
    resolveA(B)
    resolveB(C)
    resolveC('foo')
    A.then(function (result) {
      assert(result === 'foo')
      done()
    })
  })
  it('does not result in any wierd behaviour - 2', function (done) {
    var resolveA, resolveB, resolveC, resolveD
    var A = new Promise(function (resolve, reject) {
      resolveA = resolve
    })
    var B = new Promise(function (resolve, reject) {
      resolveB = resolve
    })
    var C = new Promise(function (resolve, reject) {
      resolveC = resolve
    })
    var D = new Promise(function (resolve, reject) {
      resolveD = resolve
    })
    var Athen = A.then, Bthen = B.then, Cthen = C.then, Dthen = D.then
    resolveA(B)
    resolveB(C)
    resolveC(D)
    resolveD('foo')
    A.then(function (result) {
      assert(result === 'foo')
      done()
    })
  })
  it('does not result in any wierd behaviour - 2', function (done) {
    var promises = []
    var resolveFns = []
    for (var i = 0; i < 100; i++) {
      promises.push(new Promise(function (resolve) {
        resolveFns.push(resolve)
      }))
    }
    for (var i = 0; i < 99; i++) {
      resolveFns[i](promises[i + 1])
    }
    resolveFns[99]('foo')
    promises[0].then(function (result) {
      assert(result === 'foo')
      done()
    })
  })
})
