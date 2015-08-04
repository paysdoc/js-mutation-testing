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
            '===': {boundary: '==', negation: '!=='},
            '==': {boundary: '===', negation: '!='},
            '!==': {boundary: '!=', negation: '==='},
            '!=': {boundary: '!==', negation: '=='}
        };

    function EqualityOperatorMO (subTree, replacement) {
        MutationOperator.call(this, subTree);
        this._original = replacement;
    }

    EqualityOperatorMO.prototype.apply = function () {
        var mutation;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = this._original;
            mutation = MutationUtils.createOperatorMutation(this._astNode, this._original);
        }
        return mutation;
    };

    EqualityOperatorMO.prototype.revert = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    module.exports.create = function(subTree) {
        if (operators.hasOwnProperty(this._astNode.operator)) {
            var boundaryOperator = operators[this._astNode.operator].boundary;
            var negationOperator = operators[this._astNode.operator].negation;

            if (!!boundaryOperator) {
                return new EqualityOperatorMO(subTree, boundaryOperator);
            }

            if (!!negationOperator) {
                return new EqualityOperatorMO(subTree, negationOperator);
            }
        }
    };
    module.exports.code = 'EQUALITY';
    module.exports.exclude = true;
})(module);
