/**
 * Mutates a single file and runs given unit test against it
 * @author Martin Koster [paysdoc@gmail.com], created on 05/10/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var MutationConfiguration = require('./MutationConfiguration'),
        MutationOperatorRegistry = require('./MutationOperatorRegistry'),
        MutationOperatorWarden = require('./MutationOperatorWarden'),
        ReportGenerator = require('./reporter/ReportGenerator'),
        MutationAnalyser = require('./MutationAnalyser'),
        JSParserWrapper = require('./JSParserWrapper'),
        PromiseUtils = require('./utils/PromiseUtils'),
        IOUtils = require('./utils/IOUtils'),
        TestStatus = require('./TestStatus'),
        Mutator = require('./Mutator'),
        exec = require('sync-exec'),
        _ = require('lodash'),
        Q = require('q');

    var MutationFileTester = function(fileName, config, mutationScoreCalculator) {
        this._fileName = fileName;
        this._config = config.getMutate ? config : new MutationConfiguration(config);
        this._mutationScoreCalculator = mutationScoreCalculator;
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

        mutator = new Mutator(src);
        _.forEach(mutationAnalyser.collectMutations(moWarden), function (mutationOperatorSet) {
            function mutateAndWriteFile() {
                var mutationDescriptions = mutator.mutate(mutationOperatorSet);
                return IOUtils.promiseToWriteFile(fileName, JSParserWrapper.generate(ast))
                    .then(function() {return mutationDescriptions;});
            }

            function postProcessing(result) {
                mutationResults.push(ReportGenerator.createMutationLogMessage(config, fileName, mutationDescriptions, src, result));
                mutationScoreCalculator.calculateScore(fileName, result, mutationAnalyser.getIgnored());
                mutator.unMutate();
            }

            promise = PromiseUtils.runSequence([
                mutateAndWriteFile,                     // apply the mutations
                function() {return executeTest(test);}, // run the test
                postProcessing                          // revert the mutation and generate mutation report
            ], promise);
        });
        return promise;
    };

    function executeTest(test) {
        var testPromise;

        if (typeof test === 'string') {
            testPromise = PromiseUtils.promisify(function(resolver) {
                resolver(exec(test).status);
            }, true);
        } else {
            testPromise = PromiseUtils.promisify(function(resolver) {
                test(function (status) { resolver(status); });
            }, true);
        }
        return testPromise.then(function(returnCode) {
            return returnCode === 0 ? TestStatus.KILLED : TestStatus.SURVIVED;
        });
    }

    module.exports = MutationFileTester;
})(module);