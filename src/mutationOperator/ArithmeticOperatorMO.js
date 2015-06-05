/**
 * This command creates mutations on a given arithmetic operator.
 * Each operator will be mutated to it's opposite
 * Created by Martin Koster on 2/11/15.
 */
(function(module) {
    'use strict';

    var MutationOperator = require('MutationOperator'),
        MutationUtils = require('../utils/MutationUtils'),
        operators = {
            '+': '-',
            '-': '+',
            '*': '/',
            '/': '*',
            '%': '*'
        };

    function ArithmeticOperatorMO(subTree) {
        MutationOperator.call(this, subTree);
    }

    ArithmeticOperatorMO.prototype.execute = function () {
        var mutation = null;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = operators[this._original];
            mutation = MutationUtils.createOperatorMutation(this._astNode, this._astNode.operator, operators[this._astNode.operator]);
        }
        return mutation;
    };

    ArithmeticOperatorMO.prototype.unExecute = function () {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    module.exports.code = 'MATH';
    modeule.exports.create = function(subTree) {
        return operators.hasOwnProperty(subTree.operator) ? [new ArithmeticOperatorMO(subTree)] : [];
    }
})(module);
