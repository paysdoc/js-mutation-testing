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
     * @param cb callback to be turned into a function
     * @returns {*|d.promise|Function|promise|r.promise}
     */
    module.exports.promisify = function(cb) {
        var dfd;

        if (Q.isPromise(cb)) {return cb;}
        dfd = Q.defer();
        cb(function(result) {
            dfd.resolve(result);
        });

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
        return _.reduce(functions, Q.when, promise || new Q()).catch(function (reason) {errorHandler(reason);});
    };
})(module);