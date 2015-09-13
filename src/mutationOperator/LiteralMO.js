/**
 * This command performs mutations on literals of type string, number of boolean
 * Created by Martin Koster on 2/12/15.
 */
(function(module) {
    'use strict';

    var MutationUtils = require('../utils/MutationUtils'),
        LiteralUtils = require('../utils/LiteralUtils'),
        MutationOperator = require('./MutationOperator');

    function LiteralMO (astNode) {
        MutationOperator.call(this, astNode);
        this._replacement = LiteralUtils.determineReplacement(astNode.value);
    }

    LiteralMO.prototype.apply = function () {
        var value = this._astNode.value,
            mutationInfo;

        if (!this._original) {
            this._original = value;
            if (this._replacement) {
                this._astNode.value = this._replacement;
                mutationInfo = MutationUtils.createMutation(this._astNode, this._astNode.range[1], value, this._replacement);
            }
        }

        return mutationInfo;
    };

    LiteralMO.prototype.getReplacement = function() {
        var astNode = this._astNode;

        return {
            value: this._replacement,
            begin: astNode.range[0],
            end: astNode.range[1]
        };
    };

    LiteralMO.prototype.revert = function() {
        this._astNode.value = this._original || this._astNode.value;
        this._original = null;
    };

    module.exports.create = function(astNode) {
        return [new LiteralMO(astNode)];
    };
    module.exports.code = 'LITERAL';
})(module);
