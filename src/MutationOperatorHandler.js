/**
 * The mutation operator handler will invoke the application of a set of mutations to the source code.
 * The mutation operations will be stored in a stack to enable reversal of the mutation
 *
 * Created by Martin Koster on 2/11/15.
 */
(function (module) {
    'use strict';

    function MutationOperatorHandler() {
        this._moStack = [];
    }

    MutationOperatorHandler.prototype.applyMutation = function(mutationOperatorSet) {
        applyOperation(mutationOperatorSet, 'execute');
        this._moStack.push(mutationOperatorSet);
    };

    MutationOperatorHandler.prototype.undo = function() {
        var mutationOperatorSet = this._moStack.pop();
        applyOperation(mutationOperatorSet, 'unExecute');
    };

    function applyOperation(operatorSet, operation) {
        _.forEach(operatorSet, function(operator) {
            operator[operation]();
        })
    }

    module.exports = MutationOperatorHandler;
})(module);
