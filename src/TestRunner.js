/**
 * runs a given test with given configuration
 * Created by martin on 17/03/16.
 */
(function TestRunner(module) {
    'use strict';

    var PromiseUtils = require('./utils/PromiseUtils'),
        TestStatus = require('./TestStatus'),
        exec = require('sync-exec'),
        log4js = require('log4js');

    var logger = log4js.getLogger('TestRunner');
    function runTest(config, test) {
        var testPromise;

        if (typeof test === 'string') {
            testPromise = PromiseUtils.promisify(function(resolver) {
                //FIXME: this probably doesn't pick up the mutated test files
                resolver(exec(test).status);
            }, true);
        } else {
            testPromise = PromiseUtils.promisify(function(resolver) {
                try {
                    logger.trace('executing test with path \'%s\', code \'%s\' and specs \'%s\'', config.get('basePath'), config.get('mutate'), config.get('specs'));
                    test({
                        basePath: config.get('basePath'),
                        lib: config.get('lib'),
                        src: config.get('mutate'),
                        specs: config.get('specs')
                    }, function (status) { // TODO: what statuses do other unit test frameworks return? - this should be more generic
                        resolver(status ? 0 : 1);
                    });
                } catch(err) {
                    resolver(1); //test killed
                }

            }, true);
        }
        return testPromise.then(function(returnCode) {
            return returnCode > 0 ? TestStatus.KILLED : TestStatus.SURVIVED;
        });
    }

    module.exports = {
        runTest: runTest
    };
})(module);
