/**
 * utility functions centred around promises
 * @author Martin Koster [paysdoc@gmail.com], created on 05/10/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var Q = require('q'),
        _ = require('lodash');

    /**
     * turns given function into a promise
     * @param {function} fn function to be turned into a function
     * @param {boolean} [willResolve] when set to true 'fn' will call the resolver itself, otherwise the resolver will be invoked by promisify
     * @returns {Q} A promise that will resolve when the given function has completed
     */
    module.exports.promisify = function(fn, willResolve) {
        var argsArray = Array.prototype.slice.call(arguments, 2);

        if (Q.isPromise(fn)) {
            return fn;
        }

        return Q.Promise(willResolve ? fn : function(resolve) {fn.apply({}, argsArray); resolve();});
    };

    /**
     * runs the functions in the given array as a promise sequence, returning the promise of the last function to be executed
     * @param {Array} functions array of functions to be run as a promise sequence
     * @param {Q} (promise) initial promise - if not given a new promise will be made
     * @param {Function} (errorCB) callback to be executed in case an error occurs. Will be called with the error reason
     */
    module.exports.runSequence = function(functions, promise, errorCB) {
        var errorHandler = errorCB || function(error) {throw error;};
        return _.reduce(functions, Q.when, promise || new Q({})).catch(function (reason) {errorHandler(reason);});
    };
})(module);