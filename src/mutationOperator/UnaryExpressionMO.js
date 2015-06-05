/**
 * This command removes unary expressions.
 *
 * e.g. -42 becomes 42, -true becomes true, !false becomes false, ~123 becomes 123.
 *
 * Created by Merlin Weemaes on 2/19/15.
 */
(function(module) {
    'use strict';

    var MutationUtils = require('../utils/MutationUtils'),
        MutationOperator = require('MutationOperator');

    function UnaryExpressionMO(subTree) {
        MutationOperator.call(this, subTree);
    }

    UnaryExpressionMO.prototype.execute = function () {
        var mutation;

        if (!this._original) {
            this._original = this._astNode.operator;
            delete this._astNode.operator;
            mutation = MutationUtils.createUnaryOperatorMutation(this._astNode, this._parentMutationId, "");
        }

        return mutation;
    };

    UnaryExpressionMO.prototype.unExecute=  function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    module.exports.create = function() {
        return [new UnaryExpressionMO(subTree)];
    };
    module.exports.code = 'UNARY_EXPRESSION';
})(module);
