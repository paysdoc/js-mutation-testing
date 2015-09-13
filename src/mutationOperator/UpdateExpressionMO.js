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
        this._replacement = updateOperatorReplacements[astNode.operator];
    }

    UpdateExpressionMO.prototype.apply = function () {
        var astNode = this._astNode,
            mutationInfo;

        if (!this._original) {
            this._original = astNode.operator;
            astNode.operator = this._replacement;
            if (astNode.prefix) {
                // e.g. ++x
                mutationInfo = MutationUtils.createMutation(astNode, astNode.argument.range[0], this._original, this._replacement);
            } else {
                // e.g. x++
                mutationInfo = _.merge(MutationUtils.createMutation(astNode, astNode.argument.range[1], this._original, this._replacement), {
                    begin: astNode.argument.range[1],
                    line: astNode.loc.end.line,
                    col: astNode.argument.loc.end.column
                });
            }
        }

        return mutationInfo;
    };

    UpdateExpressionMO.prototype.revert = function() {
        this._astNode.operator = this._original || this._astNode.operator;
        this._original = null;
    };

    UpdateExpressionMO.prototype.getReplacement = function() {
        var astNode = this._astNode,
            coordinates = astNode.prefix ?
            {begin: astNode.range[0], end: astNode.argument.range[0]} :
            {begin: astNode.argument.range[1], end: astNode.range[1]};

        return _.merge({value: this._replacement}, coordinates);
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
