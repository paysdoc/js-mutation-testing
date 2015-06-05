/**
 * This command creates mutations on logical operators.
 *
 * Created by Merlin Weemaes on 2/24/15.
 */
(function(module) {
    'use strict';

    var MutationOperator = require('MutationOperator'),
        MutationUtils = require('../utils/MutationUtils'),
        operators = {
            '&&': '||',
            '||': '&&'
        };

    function LogicalExpressionMO(subTree) {
        MutationOperator.call(this, subTree);
    }

    LogicalExpressionMO.prototype.execute = function () {
        var mutation;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = operators[this._astNode.operator];
            mutation = MutationUtils.createOperatorMutation(this._astNode, this._astNode.operator, this._original);
        }

        return mutation;
    };

    LogicalExpressionMO.prototype.unExecute = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    module.exports.create = function(subTree){
        return operators.hasOwnProperty(this._astNode.operator) ? [new LogicalExpressionMO(subTree)] : []
    };
    module.exports.code = 'LOGICAL_EXPRESSION';
})(module);
