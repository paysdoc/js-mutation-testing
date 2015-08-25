/**
 * This command creates mutations on logical operators.
 *
 * TODO: What about '!'?
 * Created by Merlin Weemaes on 2/24/15.
 */
(function(module) {
    'use strict';

    var MutationOperator = require('./MutationOperator'),
        MutationUtils = require('../utils/MutationUtils'),
        operators = {
            '&&': '||',
            '||': '&&'
        };

    function LogicalExpressionMO(subTree) {
        MutationOperator.call(this, subTree);
    }

    LogicalExpressionMO.prototype.apply = function () {
        var mutation;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = operators[this._astNode.operator];
            mutation = MutationUtils.createOperatorMutation(this._astNode, this._astNode.operator, this._original);
        }

        return mutation;
    };

    LogicalExpressionMO.prototype.revert = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    module.exports.create = function(subTree){
        return operators.hasOwnProperty(subTree.node.operator) ? [new LogicalExpressionMO(subTree)] : [];
    };
    module.exports.code = 'LOGICAL_EXPRESSION';
})(module);
