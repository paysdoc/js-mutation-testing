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

    function LogicalExpressionMO(astNode) {
        MutationOperator.call(this, astNode);
    }

    LogicalExpressionMO.prototype.apply = function () {
        var mutationInfo;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = operators[this._astNode.operator];
            mutationInfo = MutationUtils.createOperatorMutation(this._astNode, this._astNode.operator, this._original);
        }

        return mutationInfo;
    };

    LogicalExpressionMO.prototype.revert = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    LogicalExpressionMO.prototype.getReplacement = function() {
        var astNode = this._astNode;

        return {
            value: operators[this._original ? this._original : this._astNode.operator],
            begin: astNode.left.range[1],
            end: astNode.right.range[0]
        };
    };

    module.exports.create = function(astNode){
        return operators.hasOwnProperty(astNode.operator) ? [new LogicalExpressionMO(astNode)] : [];
    };
    module.exports.code = 'LOGICAL_EXPRESSION';
})(module);
