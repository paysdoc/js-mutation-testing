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
    }

    LiteralMO.prototype.apply = function () {
        var value = this._astNode.value,
            replacement, mutation;

        if (!this._original) {
            this._original = value;
            replacement = LiteralUtils.determineReplacement(value);
            if (replacement) {
                this._astNode.value = replacement;
                mutation = MutationUtils.createMutation(this._astNode, this._astNode.range[1], value, replacement);
            }
        }

        return mutation;
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
