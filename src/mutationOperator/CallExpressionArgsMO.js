/**
 * MutationOperator that mutates the arguments of a call expression
 * @author Martin Koster [paysdoc@gmail.com], created on 10/09/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var MutationOperator = require('./MutationOperator'),
        MutationUtils = require('../utils/MutationUtils');

    var code = 'METHOD_CALL';
    function CallExpressionArgsMO (astNode, replacement, index) {
        MutationOperator.call(this, astNode);
        this.code = code;
        this._index = index;
        this._replacement = replacement;
    }

    CallExpressionArgsMO.prototype.apply = function() {
        var i = this._index,
            args = this._astNode['arguments'],
            mutationInfo;

        if (!this._original) {
            this._original = args[i];
            mutationInfo = MutationUtils.createMutation(args[i], args[i].range[1], this._original, this._replacement.value);
            args[i] = this._replacement;
        }

        return mutationInfo;
    };

    CallExpressionArgsMO.prototype.revert = function() {
        if (this._original) {
            this._astNode['arguments'][this._index] = this._original;
            this._original = null;
        }
    };

    CallExpressionArgsMO.prototype.getReplacement = function() {
        var original = this._original || this._astNode['arguments'][this._index];

        return {
            value: this._replacement,
            begin: original.range[0],
            end: original.range[1]
        };
    };

    module.exports.create = function(astNode, replacement, index) {return new CallExpressionArgsMO(astNode, replacement, index);};
    module.exports.code = code;

})(module);