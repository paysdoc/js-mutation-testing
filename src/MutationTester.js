/**
 * Tests a unit by mutating it and running the given test
 * Copyright (c) 2015 Martin Koster, Jimi van der Woning
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var MutationScoreCalculator = require('./MutationScoreCalculator'),
        MutationConfiguration = require('./MutationConfiguration'),
        MutationFileTester = require('./MutationFileTester'),
        ReportGenerator = require('./reporter/reportGenerator'),
        PromiseUtils = require('./utils/PromiseUtils'),
        TestStatus = require('./TestStatus'),
        IOUtils = require('./utils/IOUtils'),
        _ = require('lodash'),
        log4js = require('log4js');

    var logger = log4js.getLogger('MutationTester');
    var MutationTester = function(options) {
        this._config = new MutationConfiguration(options);
        this._mutationScoreCalculator = new MutationScoreCalculator();
    };

    MutationTester.prototype.test = function(testCallback) {
        var config = this._config,
            promise = PromiseUtils.promisify(config.getBefore()), //run the before section in a promise
            test = testCallback || config.getTester(),
            self = this,
            src,
            fileMutationResults = [];

        _.forEach(config.getMutate(), function(fileName) {
            promise = PromiseUtils.runSequence( [
                config.getBeforeEach,                                                           // execute beforeEach
                function() {return IOUtils.promiseToReadFile(fileName);},                       // read file
                function(source) {src = source; mutateAndTestFile(fileName, src, test, self);}, // perform mutation testing on the file
                function(mutationResults) {doReporting(fileName, src, mutationResults, self);}, // do reporting
                config.getAfterEach,                                                            // execute afterEach
                function(fileMutationResult) {fileMutationResults.push(fileMutationResult);}    // collect the results
            ], promise, function(error) {handleError(error, fileName, self);});
        });

        promise.finally(function() {
            PromiseUtils.promisify(config.getAfter())
                .then(function() {                                //run possible post processing
                    logger.info('Mutation Test complete');
                    return fileMutationResults;
                }
            );
        });
    };

    function mutateAndTestFile(fileName, src, test, ctx) {
        var mutationFileTester = new MutationFileTester(fileName, ctx._config, ctx._mutationScoreCalculator);
        return mutationFileTester.testFile(src, test);
    }

    function doReporting(fileName, src, mutationResults, ctx) {
        var config = ctx._config;
        var fileMutationResult = {
            stats: ctx._mutationScoreCalculator.getScorePerFile(fileName),
            src: src,
            fileName: fileName,
            mutationResults: mutationResults
        };
        ReportGenerator.generate(config.getReporters(), fileMutationResult, function() {
            logger.info('Done mutating file: %s', fileName);
        });
        return fileMutationResult;
    }

    function handleError(error, fileName, ctx) {
        var mutationScoreCalculator = ctx._mutationScoreCalculator;

        logger.error('An exception occurred after mutating the file: %s', fileName);
        logger.error('Error message was: %s', error.message || error);
        if (error.severity === TestStatus.FATAL) {
            logger.error('Error status was FATAL. All processing will now stop.');
            process.exit(1);
        }
        mutationScoreCalculator && mutationScoreCalculator.calculateScore(fileName, TestStatus.ERROR, 0);
    }

    module.exports = MutationTester;
})(module);
