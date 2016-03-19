/**
 * Mutates a single file and runs given unit test against it
 * @author Martin Koster [paysdoc@gmail.com], created on 05/10/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var MutationScoreCalculator = require('./MutationScoreCalculator'),
        MutationOperatorRegistry = require('./MutationOperatorRegistry'),
        MutationOperatorWarden = require('./MutationOperatorWarden'),
        MutationConfiguration = require('./MutationConfiguration'),
        ReportGenerator = require('./reporter/ReportGenerator'),
        MutationAnalyser = require('./MutationAnalyser'),
        JSParserWrapper = require('./JSParserWrapper'),
        PromiseUtils = require('./utils/PromiseUtils'),
        TestRunner = require('./TestRunner'),
        IOUtils = require('./utils/IOUtils'),
        Mutator = require('./Mutator'),
        log4js = require('log4js'),
        _ = require('lodash'),
        Q = require('q');

    var logger = log4js.getLogger('MutationFileTester');
    var MutationFileTester = function(fileName, config, mutationScoreCalculator) {
        this._fileName = fileName;
        this._config = typeof config.onInitComplete === 'function' ? config : new MutationConfiguration(config);
        this._mutationScoreCalculator = mutationScoreCalculator || new MutationScoreCalculator();
    };

    MutationFileTester.prototype.testFile = function(src, test) {
        var mutationScoreCalculator = this._mutationScoreCalculator,
            config = this._config,
            fileName = this._fileName,
            moWarden = new MutationOperatorWarden(src, config, MutationOperatorRegistry.getMutationOperatorTypes()),
            ast = JSParserWrapper.parse(src),
            mutationAnalyser = new MutationAnalyser(ast),
            mutationDescriptions,
            mutationResults = [],
            mutator = new Mutator(src),
            promise = new Q({});

        function mutateAndWriteFile(mutationOperatorSet) {
            mutationDescriptions = mutator.mutate(mutationOperatorSet);
            logger.info('writing file', fileName, '\n', JSParserWrapper.stringify(ast));
            return IOUtils.promiseToWriteFile(fileName, JSParserWrapper.stringify(ast))
                .then(function() {
                    return mutationDescriptions;
                });
        }

        function postProcessing(result) {
            mutationDescriptions.forEach(function(mutationDescription) {
                mutationResults.push(ReportGenerator.createMutationLogMessage(config, fileName, mutationDescription, src, result));
            });
            mutationScoreCalculator.calculateScore(fileName, result, mutationAnalyser.getIgnored());
            mutator.unMutate();
        }

        function doReporting() {
            var fileMutationResult = {
                stats: mutationScoreCalculator.getScorePerFile(fileName),
                src: src,
                fileName: fileName,
                mutationResults: mutationResults
            };
            ReportGenerator.generate(config, fileMutationResult, function() {
                logger.info('Done mutating file: %s', fileName);
            });
            return fileMutationResult;
        }

        mutator = new Mutator(src);
        _.forEach(mutationAnalyser.collectMutations(moWarden), function (mutationOperatorSet) {
            promise = PromiseUtils.runSequence([
                function() {return mutateAndWriteFile(mutationOperatorSet);},  // apply the mutations
                function() {return TestRunner.runTest(config, test);},         // run the test
                postProcessing                                                 // revert the mutation and generate mutation report
            ], promise, handleError);
        });

        return promise.then(doReporting);
    };

    function handleError(error) {
        logger.error('file processing stopped', error);
        throw(error); //throw up to calling party
    }

    module.exports = MutationFileTester;
})(module);