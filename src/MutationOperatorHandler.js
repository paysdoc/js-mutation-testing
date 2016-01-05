/**
 * The mutation operator handler will invoke the application of a set of mutations to the source code.
 * The mutation operations will be stored in a stack to enable reversal of the mutation
 *
 * Mutation Operations are applied in sets. This enables multiple mutation operations to be applied between tests.
 * With first order mutations these sets will always contain 1 mutation each. Only once we get to implementing higher order
 * mutations can sets contain more than one mutation.
 *
 * Created by Martin Koster on 2/11/15.
 * Licensed under the MIT license.
 */
(function (module) {
    'use strict';

    var _ = require('lodash'),
        log4js = require('log4js');

    var logger = log4js.getLogger('MutationOperatorHandler');
    function MutationOperatorHandler() {
        this._moStack = [];
    }

    MutationOperatorHandler.prototype.applyMutation = function(mutationOperatorSet) {
        var result = [];
        _.forEach(mutationOperatorSet, function(operator) {
            logger.trace('applying mutation', operator.code);
            result.push(operator.apply());
            logger.trace('applied mutation', result);
        });
        this._moStack.push(mutationOperatorSet);
        return result;
    };

    MutationOperatorHandler.prototype.revertMutation = function() {
        var mutationOperatorSet = this._moStack.pop();
        _.forEach(mutationOperatorSet, function(operator) {
            operator.revert();
        });
    };

    module.exports = MutationOperatorHandler;
})(module);
