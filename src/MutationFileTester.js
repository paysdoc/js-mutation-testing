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
        IOUtils = require('./utils/IOUtils'),
        TestStatus = require('./TestStatus'),
        Mutator = require('./Mutator'),
        exec = require('sync-exec'),
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
            logger.trace('applying mutation');
            mutationDescriptions = mutator.mutate(mutationOperatorSet);
            logger.trace('writing file', fileName, '\n', JSParserWrapper.stringify(ast));
            return IOUtils.promiseToWriteFile(fileName, JSParserWrapper.stringify(ast))
                .then(function() {
                    logger.trace('mutation descriptions', JSON.stringify(mutationDescriptions));
                    return mutationDescriptions;
                });
        }

        function postProcessing(result) {
            logger.trace('post processing with result', result);
            mutationDescriptions.forEach(function(mutationDescription) {
                mutationResults.push(ReportGenerator.createMutationLogMessage(config, fileName, mutationDescription, src, result));
            });
            logger.trace('calculating score', fileName, result, mutationAnalyser.getIgnored());
            mutationScoreCalculator.calculateScore(fileName, result, mutationAnalyser.getIgnored());
            mutator.unMutate();
        }

        mutator = new Mutator(src);
        _.forEach(mutationAnalyser.collectMutations(moWarden), function (mutationOperatorSet) {
            promise = PromiseUtils.runSequence([
                function() {return mutateAndWriteFile(mutationOperatorSet);},                                          // apply the mutations
                function() {return executeTest(config, test);}, // run the test
                postProcessing                                                                                         // revert the mutation and generate mutation report
            ], promise, handleError);
        });

        return promise.then(function() {
            logger.trace('returning results');
            return mutationResults;
        });
    };

    function executeTest(config, test) {
        var testPromise;

        if (typeof test === 'string') {
            testPromise = PromiseUtils.promisify(function(resolver) {
                //TODO: test this - it probably doesn't pick up the mutated test files
                resolver(exec(test).status);
            }, true);
        } else {
            testPromise = PromiseUtils.promisify(function(resolver) {
                try {
                    logger.trace('executing test with path \'%s\', code \'%s\' and specs \'%s\'', config.getBasePath(), config.getMutate(), config.getSpecs());
                    test({
                        basePath: config.getBasePath(),
                        lib: config.getLib(),
                        src: config.getMutate(),
                        specs: config.getSpecs()
                    }, function (status) {
                        logger.debug(status);
                        resolver(status ? 0 : 1);
                    });
                } catch(err) {
                    logger.warn('unit test exception caught', err);
                    resolver(1); //test killed
                }

            }, true);
        }
        return testPromise.then(function(returnCode) {
            logger.trace('resolving with return code', returnCode);
            return returnCode > 0 ? TestStatus.KILLED : TestStatus.SURVIVED;
        });
    }

    function handleError(error) {
        logger.error('file processing stopped', error);
        throw(error); //throw up to calling party
    }

    module.exports = MutationFileTester;
})(module);