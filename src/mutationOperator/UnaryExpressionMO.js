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

    var code = 'UNARY_EXPRESSION';
    function UnaryExpressionMO(astNode) {
        MutationOperator.call(this, astNode);
        this.code = code;
    }

    UnaryExpressionMO.prototype.apply = function () {
        var mutationInfo;

        if (!this._original) {
            this._original = this._astNode;
            this._astNode = this._astNode.argument;
            mutationInfo = MutationUtils.createUnaryOperatorMutation(this._astNode, this._parentMutationId, "");
        }

        return mutationInfo;
    };

    UnaryExpressionMO.prototype.revert = function() {
        this._astNode = this._original || this._astNode;
        this._original = null;
    };

    UnaryExpressionMO.prototype.getReplacement = function() {
        var astNode = this._astNode;

        return {
            value: null,
            begin: astNode.range[0],
            end: astNode.range[0]+1
        };
    };

    module.exports.create = function(astNode) {
        return astNode.operator ? [new UnaryExpressionMO(astNode)] : [];
    };
    module.exports.code = code;
})(module);
