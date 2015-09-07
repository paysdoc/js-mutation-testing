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
        MutationOperator = require('./MutationOperator');

    function UnaryExpressionMO(astNode) {
        MutationOperator.call(this, astNode);
    }

    UnaryExpressionMO.prototype.apply = function () {
        var mutation;

        if (!this._original) {
            this._original = this._astNode.operator;
            delete this._astNode.operator;
            mutation = MutationUtils.createUnaryOperatorMutation(this._astNode, this._parentMutationId, "");
        }

        return mutation;
    };

    UnaryExpressionMO.prototype.revert=  function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    UnaryExpressionMO.prototype.getReplacement = function() {
        return null;
    };

    module.exports.create = function(astNode) {
        return astNode.operator ? [new UnaryExpressionMO(astNode)] : [];
    };
    module.exports.code = 'UNARY_EXPRESSION';
})(module);
