/**
 * This generator creates reports using istanbul.
 *
 * Created by Merlin Weemaes on 2/26/15.
 */
(function(module) {
    'use strict';

    var log4js = require('log4js'),
        path = require('path'),
        HtmlReporter = require('./html/HtmlReporter'),
        IOUtils = require('../utils/IOUtils'),
        TestStatus = require('../TestStatus'),
        DEFAULT_DIR = path.join('reports', 'js-mutation-testing');

    var logger = log4js.getLogger('ReportGenerator');

    module.exports.generate = function(config, results, cb) {
        var dir = config.get('reportingDir') || DEFAULT_DIR,
            report = new HtmlReporter(dir, config);

        logger.trace('Generating the mutation report...' + JSON.stringify(results));

        report.create(results)
            .then(function() {
                logger.info('Generated the mutation report in: %s', dir);
            })
            .catch(function(error) {
                logger.error('Error creating report: %s', error.message || error);
            })
            .done(cb);
    };

    module.exports.createMutationLogMessage = function(config, srcFilePath, mutation, src, testStatus) {
        var srcFileName = IOUtils.getRelativeFilePath(config.get('basePath'), srcFilePath),
            currentMutationPosition = srcFileName + ':' + mutation.line + ':' + (mutation.col + 1);
        var message = currentMutationPosition + (
                    mutation.replacement ?
                    ' Replaced ' + truncateReplacement(config, mutation.original) + ' with ' + truncateReplacement(config, mutation.replacement) + ' -> ' + testStatus :
                    ' Removed ' + truncateReplacement(config, mutation.original) + ' -> ' + testStatus
                );

        logger.trace('creating log message', message);
        return {
            mutation: mutation,
            survived: testStatus === TestStatus.SURVIVED,
            message: message
        };
    };

    function truncateReplacement(config, replacementArg) {
        var maxLength = config.get('maxReportedMutationLength'),
            replacement;
        if (typeof replacementArg === 'string') {
            replacement = replacementArg.replace(/\s+/g, ' ');
            if (maxLength > 0 && replacement.length > maxLength) {
                return replacement.slice(0, maxLength / 2) + ' ... ' + replacement.slice(-maxLength / 2);
            }
        } else {
            replacement = replacementArg;
        }
        return replacement;
    }

    function createStatsMessage(stats) {
        var ignoredMessage = stats.ignored ? ' ' + stats.ignored + ' mutations were ignored.' : '';
        var allUnIgnored = stats.all - stats.ignored;
        var testedMutations = allUnIgnored - stats.untested - stats.survived;
        var percentTested = Math.floor((testedMutations / allUnIgnored) * 100);
        return testedMutations +
            ' of ' + allUnIgnored + ' unignored mutations are tested (' + percentTested + '%).' + ignoredMessage;
    }
})(module);

