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

    function EqualityOperatorMO (astNode, replacement) {
        MutationOperator.call(this, astNode);
        this._replacement = replacement;
    }

    EqualityOperatorMO.prototype.apply = function () {
        var mutationInfo;

        if (!this._original) {
            this._original = this._astNode.operator;
            this._astNode.operator = this._replacement;
            mutationInfo = MutationUtils.createOperatorMutation(this._astNode, this._original, this._replacement);
        }
        return mutationInfo;
    };

    EqualityOperatorMO.prototype.revert = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    EqualityOperatorMO.prototype.getReplacement = function() {
        var astNode = this._astNode;

        return {
            value: this._replacement,
            begin: astNode.left.range[1],
            end: astNode.right.range[0]
        };
    };

    module.exports.create = function(astNode) {
        return operators.hasOwnProperty(astNode.operator) ? [new EqualityOperatorMO(astNode, operators[astNode.operator])] : [];
    };

    module.exports.code = 'EQUALITY';
    module.exports.exclude = true;
})(module);
