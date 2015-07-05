/**
 * Tests a unit by mutating it and running the given test
 * Copyright (c) 2015 Martin Koster, Jimi van der Woning
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var MutationAnalyser = require('./MutationAnalyser'),
        Mutator = require('./Mutator'),
        JSParserWrapper = require('./JSParserWrapper'),
        exec = require('sync-exec'),
        IOUtils = require('./utils/IOUtils'),
        _ = require('lodash'),
        log4js = require('log4js'),
        Q = require('q');

    var logger = log4js.getLogger('MutationTester');
    var MutationTester = function(fileNames, options) {
        this._excludeMutations = options.excludeMutations;
        this._fileNames = fileNames;
    };

    MutationTester.prototype.test = function(testCallback) {
        var self = this,
            promise = new Q({});
        _.forEach(this._fileNames, function(fileName) {
            promise = promise.then(function() {
                return self.testFile(fileName, testCallback);
            });
        });

        promise.fin(function() {

        });
    };

    MutationTester.prototype.testFile = function(fileName, testCallback) {
        var self = this,
            testPromise;

        testPromise = IOUtils.promiseToReadFile(fileName).then(function (src) {
            var mutationReports,
                ast = JSParserWrapper.parse(src),
                mutationResults = [],
                mutator,
                promise = new Q({});

            mutator = new Mutator(src);
            _.forEach(new MutationAnalyser(ast).collectMutations(self._excludeMutations), function(mutationOperatorSet) {
                promise = promise
                    .then(function () {
                        mutationReports = mutator.mutate(mutationOperatorSet);
                        IOUtils.promiseToWriteFile(fileName, JSParserWrapper.generate(ast));
                    })
                    .then(function () {
                        executeTest(testCallback);
                    })
                    .then(function (result) {
                        mutationResults.push({fileName: fileName, mutations: mutationReports, result: result});
                        mutator.unMutate();
                        return mutationResults;
                    });
            });
            return promise;
        }).then(function() {
            logger.debug('Done mutating file: %s', fileName);
        });

        return testPromise;
    };


    function executeTest(test) {
        var deferred = Q.defer();
        if (typeof test === 'string') {
            var execResult = exec(test);
            deferred.resolve(execResult.status);
        } else {
            test(function (status) {
                deferred.resolve(status);
            });
        }
        return deferred.promise;
    }


    module.exports = MutationTester;
})(module);
