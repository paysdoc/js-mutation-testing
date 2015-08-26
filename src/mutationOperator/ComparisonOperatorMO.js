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

    function ComparisonOperatorMO (astNode, replacement) {
        MutationOperator.call(this, astNode);
        this._replacement = replacement;
    }

    ComparisonOperatorMO.prototype.apply = function () {
        var mutation;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = this._replacement;
            mutation = MutationUtils.createOperatorMutation(this._astNode, this._original, this._replacement);
        }
        return mutation;
    };

    ComparisonOperatorMO.prototype.revert = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    module.exports.create = function(astNode) {
        var mos = [];
        if (operators.hasOwnProperty(astNode.operator)) {
            mos.push(new ComparisonOperatorMO(astNode, operators[astNode.operator].boundary));
            mos.push(new ComparisonOperatorMO(astNode, operators[astNode.operator].negation));
        }
        return mos;
    };
    module.exports.code = 'COMPARISON';
})(module);
