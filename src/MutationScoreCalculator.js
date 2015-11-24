/**
 * Keeps statistics and calculates mutation scores per file and overall
 * @author Martin Koster [paysdoc@gmail.com], created on 12/06/15.
 * Licensed under the MIT license.
 */
(function(module){
    'use strict';
    var _ = require('lodash'),
        TestStatus = require('./TestStatus');

    var MutationScoreCalculator = function() {
        this._scorePerFile = {};
    };

    MutationScoreCalculator.prototype.calculateScore = function(fileName, testStatus, ignoredMutations) {
        this._scorePerFile[fileName] = this._scorePerFile[fileName] || {killed: 0, survived: 0, ignored: 0, error: 0};
        this._scorePerFile[fileName].ignored += ignoredMutations;
        if (testStatus === TestStatus.KILLED) {
            this._scorePerFile[fileName].killed++;
        } else if (testStatus === TestStatus.ERROR) {
            this._scorePerFile[fileName].error++;
        }else {
            this._scorePerFile[fileName].survived++;
        }
    };

    MutationScoreCalculator.prototype.getScorePerFile = function(fileName) {
        return this._scorePerFile[fileName];
    };

    MutationScoreCalculator.prototype.getTotals = function() {
        return _.reduce(this._scorePerFile, function(result, score) {
            result.killed += score.killed;
            result.survived += score.survived;
            result.ignored += score.ignored;
            result.error += score.error;
            return result;
        }, {killed: 0, survived: 0, ignored: 0, error: 0});
    };

    module.exports = MutationScoreCalculator;
})(module);
