/**
 * Spec for the promise utilities
 * @author Martin Koster [paysdoc@gmail.com], created on 13/10/15.
 * Licensed under the MIT license.
 */
describe('PromiseUtils', function() {
    var PromiseUtils = require('../../../src/utils/PromiseUtils'),
        Q = require('q'), resultOrder,
        f1 = promiseWithAsync(function() {resultOrder.push('f1');}, 150),
        f2 = promiseWithAsync(function() {resultOrder.push('f2');}, Math.random()*100),
        f3 = function() {resultOrder.push('f3');};

    beforeEach(function() {
        resultOrder = [];
    });

    it('turns a function into a promise', function(done) {
        var result,
            cbPromise = PromiseUtils.promisify(function() {result = 'result';}).then(function() {
            expect(result).toEqual('result');
            done();
        });
        expect(cbPromise.then).toBeTruthy();
    });

    it('turns a function with its own resolver into a promise', function(done) {
        var cbPromise = PromiseUtils.promisify(function(cb) {cb('result');}, true).then(function(result) {
            expect(result).toEqual('result');
            done();
        });
        expect(cbPromise.then).toBeTruthy();
    });

    it('retains the existing promise if passed to promisify', function() {
        var existingPromise = new Q(function() {return 'dummy';});
        expect(PromiseUtils.promisify(existingPromise)).toBe(existingPromise);
    });

    it('runs all given functions as a sequence of promises', function(done) {
        PromiseUtils.runSequence([f1, f2, f3], new Q({})).then(function() {
            expect(resultOrder).toEqual(['f1', 'f2', 'f3']);
            done();
        });

    });

    it('stops running the sequence if an error occurs', function(done) {
        function rotten() {throw 'something smells fishy!';}
        PromiseUtils.runSequence([f1, f2, rotten, f3]).then(function() {}, function(error) {
            expect(error).toBe('something smells fishy!');
            expect(resultOrder).toEqual(['f1', 'f2']);
            done();
        });
    });

    function promiseWithAsync(cb, timeout) {
        return function() {
            return PromiseUtils.promisify(function(resolve) {
                setTimeout(function() {cb(); resolve();}, timeout);
            }, true);
        };
    }
});