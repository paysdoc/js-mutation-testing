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
        DEFAULT_DIR = path.join('reports', 'grunt-mutation-testing');

    var logger = log4js.getLogger('ReportGenerator');

    module.exports.generate = function(config, results, cb) {
        var dir = config.dir || DEFAULT_DIR,
            report = new HtmlReporter(dir, config);

        logger.trace('Generating the mutation HTML report...');

        report.create(results)
            .then(function() {
                logger.info('Generated the mutation HTML report in: %s', dir);
            })
            .catch(function(error) {
                logger.error('Error creating report: %s', error.message || error);
            })
            .done(cb);
    };

    module.exports.createMutationLogMessage = function(config, srcFilePath, mutation, src, testStatus) {
        var srcFileName = IOUtils.getRelativeFilePath(config.getBasePath(), srcFilePath),
            currentMutationPosition = srcFileName + ':' + mutation.line + ':' + (mutation.col + 1),
            mutatedCode = src.substr(mutation.begin, mutation.end - mutation.begin),
            message = currentMutationPosition + (
                    mutation.replacement ?
                    ' Replaced ' + truncateReplacement(config, mutatedCode) + ' with ' + truncateReplacement(config, mutation.replacement) + ' -> ' + testStatus :
                    ' Removed ' + truncateReplacement(config, mutatedCode) + ' -> ' + testStatus
                );

        return {
            mutation: mutation,
            survived: testStatus === TestStatus.SURVIVED,
            message: message
        };
    };

    function truncateReplacement(config, replacementArg) {
        var maxLength = config.getMaxReportedMutationLength();
        var replacement = replacementArg.replace(/\s+/g, ' ');
        if (maxLength > 0 && replacement.length > maxLength) {
            return replacement.slice(0, maxLength / 2) + ' ... ' + replacement.slice(-maxLength / 2);
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

