/**
 * This command creates mutations on a given arithmetic operator.
 * Each operator will be mutated to it's opposite
 * Created by Martin Koster on 2/11/15.
 *
 * TODO: We'll have to add a mutation operator for bitwise operators
 */
(function(module) {
    'use strict';

    var MutationOperator = require('./MutationOperator'),
        MutationUtils = require('../utils/MutationUtils'),
        operators = {
            '+': '-',
            '-': '+',
            '*': '/',
            '/': '*',
            '%': '*'
        };

    function ArithmeticOperatorMO(astNode) {
        MutationOperator.call(this, astNode);
    }

    ArithmeticOperatorMO.prototype.apply = function () {
        var mutationInfo = null;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = operators[this._original];
            mutationInfo = MutationUtils.createOperatorMutation(this._astNode, this._astNode.operator, operators[this._astNode.operator]);
        }
        return mutationInfo;
    };

    ArithmeticOperatorMO.prototype.revert = function () {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    ArithmeticOperatorMO.prototype.getReplacement = function() {
        var astNode = this._astNode;
        return {
            value: operators[this._original ? this._original : this._astNode.operator],
            begin: astNode.left.range[1],
            end: astNode.right.range[0]
        };
    };

    module.exports.code = 'MATH';
    module.exports.create = function(astNode) {
        return operators.hasOwnProperty(astNode.operator) ? [new ArithmeticOperatorMO(astNode)] : [];
    };
})(module);
