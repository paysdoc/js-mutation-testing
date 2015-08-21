/**
 * This command creates mutations on a given equality operator.
 * Each operator can be mutated to its boundary and its negation counterpart, e.g.
 * '===' has '==' as boundary and '!==' as negation (opposite)
 * Created by Martin Koster on 2/11/15.
 */
(function(module) {
    'use strict';

    var MutationOperator = require('./MutationOperator'),
        MutationUtils = require('../utils/MutationUtils'),
        operators = {
            '===': '!==',
            '==': '!=',
            '!==': '===',
            '!=': '=='
        };

    function EqualityOperatorMO (subTree, replacement) {
        MutationOperator.call(this, subTree);
        this._replacement = replacement;
    }

    EqualityOperatorMO.prototype.apply = function () {
        var mutation;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = this._replacement;
            mutation = MutationUtils.createOperatorMutation(this._astNode, this._original, this._replacement);
        }
        return mutation;
    };

    EqualityOperatorMO.prototype.revert = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    module.exports.create = function(subTree) {
        return operators.hasOwnProperty(subTree.node.operator) ? [new EqualityOperatorMO(subTree, operators[subTree.node.operator])] : [];
    };

    module.exports.code = 'EQUALITY';
    module.exports.exclude = true;
})(module);
