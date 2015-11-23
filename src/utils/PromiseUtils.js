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
     * turns given callback into a promise
     * @param {function} fn function to be turned into a function
     * @param {boolean} willResolve when set to true 'fn' will call the resolver itself, otherwise the resolver will be invoked by promisify
     * @returns {promise}
     */
    module.exports.promisify = function(fn, willResolve) {
        var dfd,
            argsArray = Array.prototype.slice.call(arguments, 2),
            doResolve = function(result) {dfd.resolve(result);};

        if (Q.isPromise(fn)) {return fn;}
        dfd = Q.defer();
        if(willResolve) {
            argsArray.splice(0, 0, doResolve); // add doResolve callback to start of args array
            fn.apply({}, argsArray);           // and call the function knowing that the callback is the first argument
        } else {
            dfd.resolve(fn.apply({}, argsArray)); // just let the resolver call the function
        }

        return dfd.promise;
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