/**
 * This command creates mutations on a given comparison operator.
 * Each operator can be mutated to its boundary and its negation counterpart, e.g.
 * '<' has '<=' as boundary and '>=' as negation (opposite)
 * Created by Martin Koster on 2/11/15.
 */
(function(module) {
    'use strict';

    var MutationOperator = require('./MutationOperator'),
        MutationUtils = require('../utils/MutationUtils'),
        operators = {
            '<': {boundary: '<=', negation: '>='},
            '<=': {boundary: '<', negation: '>'},
            '>': {boundary: '>=', negation: '<='},
            '>=': {boundary: '>', negation: '<'}
        };

    function ComparisonOperatorMO (subTree, replacement) {
        MutationOperator.call(this, subTree);
        this._original = replacement;
    }

    ComparisonOperatorMO.prototype.apply = function () {
        var mutation;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = this._original;
            mutation = MutationUtils.createOperatorMutation(this._astNode, this._original);
        }
        return mutation;
    };

    ComparisonOperatorMO.prototype.revert = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    module.exports.create = function(subTree) {
        var mos = [];
        if (operators.hasOwnProperty(this._astNode.operator)) {
            var boundaryOperator = operators[this._astNode.operator].boundary;
            var negationOperator = operators[this._astNode.operator].negation;

            if (!!boundaryOperator) {
                mos.push(new ComparisonOperatorMO(subTree, boundaryOperator));
            }

            if (!!negationOperator) {
                mos.push(new ComparisonOperatorMO(subTree, negationOperator));
            }
        }
        return mos;
    };
    module.exports.code = 'COMPARISON';
})(module);
