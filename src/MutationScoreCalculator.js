/**
 * Keeps statistics and calculates mutation scores per file and overall
 * @author Martin Koster [paysdoc@gmail.com], created on 12/06/15.
 * Licensed under the MIT license.
 */
(function(module){
    'use strict';
    var MutationScoreCalculator = function() {
        this._scorePerFile = [];
    };

    MutationScoreCalculator.prototype.calculateScore = function() {

    };

    module.exports = MutationScoreCalculator;
})(module);

