/**
 * Mutation operator that mutates the call expression itself
 * @author Martin Koster [paysdoc@gmail.com], created on 10/09/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationOperator = require('./MutationOperator'),
        MutationUtils = require('../utils/MutationUtils');

    function CallExpressionSelfMO (astNode, replacement, index) {
        MutationOperator.call(this, astNode);
        this._index = index;
        this._replacement = replacement;
    }

    CallExpressionSelfMO.prototype.apply = function() {
        var self = this,
            astNode = this._astNode,
            mutationInfo;

        if (!this._original) {
            this._original = {};
            mutationInfo = MutationUtils.createMutation(astNode, astNode.range[1], this._original, this._replacement);
            _.forOwn(astNode, function(value, key) {
                self._original[key] = value;
                delete astNode[key];
            });
            _.forOwn(this._replacement, function(value, key) {
                astNode[key] = value;
            });
        }

        return mutationInfo;
    };

    CallExpressionSelfMO.prototype.revert = function() {
        var astNode = this._astNode;

        _.forOwn(astNode, function(value, key) {
            delete astNode[key];
        });
        _.forOwn(this._original, function(value, key) {
            astNode[key] = value;
        });
    };

    CallExpressionSelfMO.prototype.getReplacement = function() {
        return {
            value: this._replacement,
            begin: this._astNode.range[0],
            end: this._astNode.range[1]
        };
    };

    module.exports.create = function(astNode, replacement, index) {return new CallExpressionSelfMO(astNode, replacement, index);};
    module.exports.code = 'METHOD_CALL';

})(module);