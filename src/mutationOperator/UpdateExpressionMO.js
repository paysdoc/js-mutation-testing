/**
 * Command for mutating an update expression
 * Created by Martin Koster on 2/16/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationOperator = require('./MutationOperator'),
        MutationUtils = require('../utils/MutationUtils'),
        updateOperatorReplacements = {
            '++': '--',
            '--': '++'
        };

    function UpdateExpressionMO (astNode) {
        MutationOperator.call(this, astNode);
    }

    UpdateExpressionMO.prototype.apply = function () {
        var astNode = this._astNode,
            replacement = updateOperatorReplacements[astNode.operator],
            mutation;

        if (!this._original) {
            this._original = astNode.operator;
            astNode.operator = replacement;
            if (astNode.prefix) {
                // e.g. ++x
                mutation = MutationUtils.createMutation(astNode, astNode.argument.range[0], this._original, replacement);
            } else {
                // e.g. x++
                mutation = _.merge(MutationUtils.createMutation(astNode, astNode.argument.range[1], this._original, replacement), {
                    begin: astNode.argument.range[1],
                    line: astNode.loc.end.line,
                    col: astNode.argument.loc.end.column
                });
            }
        }

        return mutation;
    };

    UpdateExpressionMO.prototype.revert = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    module.exports.create = function(astNode) {
        if (updateOperatorReplacements.hasOwnProperty(astNode.operator)) {
            return [new UpdateExpressionMO(astNode)];
        } else {
            return [];
        }
    };
    module.exports.code = 'UPDATE_EXPRESSION';
})(module);
