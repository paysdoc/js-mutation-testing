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
            test = testCallback || config.getTester(),
            promise = PromiseUtils.promisify(config.getBefore()), //run the before section in a promise
            src,
            fileMutationResults = [];

        _.forEach(config.getMutate(), function(fileName) {
            promise = PromiseUtils.runSequence( [
                function() {return PromiseUtils.promisify(config.getBeforeEach());},                  // execute beforeEach
                function() {return IOUtils.promiseToReadFile(fileName)},                              // read file
                function(source) {src = source; mutateAndTestFile.call (this, fileName, src, test);}, // perform mutation testing on the file
                function(mutationResults) {doAfterEach.call(this, fileName, src, mutationResults);},  // execute afterEach and return mutation results
                function(fileMutationResult) {fileMutationResults.push(fileMutationResult);}          // collect the results
            ], promise, _.bind(handleError, this));
        });

        promise.done(function() {
            config.getAfter()(function() { //run possible post processing
                logger.info('Mutation Test complete');
            });
        });
    };

    function mutateAndTestFile(fileName, src, test) {
        var mutationFileTester = new MutationFileTester(fileName, this._config, this._mutationScoreCalculator);
        return mutationFileTester.testFile(src, test);
    }

    function doAfterEach(fileName, src, mutationResults) {
        var config = this._config;
        return PromiseUtils.promisify(config.getAfterEach())
            .then(function() {
                var fileMutationResult = {
                    stats: this._mutationScoreCalculator.getScorePerFile(fileName),
                    src: src,
                    fileName: fileName,
                    mutationResults: mutationResults
                };
                ReportGenerator.generate(config.getReporters(), fileMutationResult);
                logger.info('Done mutating file: %s', fileName);
                return fileMutationResult;
            })
    }

    function handleError(error) {
        var mutationScoreCalculator = this._mutationScoreCalculator;

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
