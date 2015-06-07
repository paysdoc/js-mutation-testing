/**
 * The mutation operator handler will invoke the application of a set of mutations to the source code.
 * The mutation operations will be stored in a stack to enable reversal of the mutation
 *
 * Created by Martin Koster on 2/11/15.
 * Licensed under the MIT license.
 */
(function (module) {
    'use strict';

    var _ = require('lodash');

    function MutationOperatorHandler() {
        this._moStack = [];
    }

    MutationOperatorHandler.prototype.applyMutation = function(mutationOperatorSet) {
        var result = [];
        _.forEach(mutationOperatorSet, function(operator) {
            result.push(operator.execute());
        });
        this._moStack.push(mutationOperatorSet);
        return result;
    };

    MutationOperatorHandler.prototype.undo = function() {
        var mutationOperatorSet = this._moStack.pop();
        _.forEach(mutationOperatorSet, function(operator) {
            operator.unExecute();
        });
    };

    module.exports = MutationOperatorHandler;
})(module);
