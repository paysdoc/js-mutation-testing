/**
 * This command creates mutations on a given array
 * Created by Martin Koster on 2/12/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationUtils = require('../utils/MutationUtils'),
        ArrayMutatorUtil = require('../utils/ArrayMutatorUtil'),
        MutationOperator = require('./MutationOperator');

    function ArrayExpressionMO (astNode, index) {
        MutationOperator.call(this, astNode);
        this._originalArray = _.clone(this._astNode.elements);
        this._original = this._astNode.elements[index];
    }

    ArrayExpressionMO.prototype.apply = function () {
        function createMutationInfo(element) {
            return MutationUtils.createMutation(element, element.range[1], element);
        }
        return ArrayMutatorUtil.removeElement(this._astNode.elements, this._original, createMutationInfo);
    };

    ArrayExpressionMO.prototype.revert = function() {
        ArrayMutatorUtil.restoreElement(this._astNode.elements, this._original, this._originalArray);
    };

    ArrayExpressionMO.prototype.getReplacement = function() {
        var element = this._original;

        return {
            value: null,
            begin: element.range[0],
            end: element.range[1]
        };
    };

    module.exports.code = 'ARRAY';
    module.exports.create = function(astNode) {
        var mos = [];

        _.forEach(astNode.elements, function(element, i) {
            mos.push(new ArrayExpressionMO(astNode, i));
        });

        return mos;
    };

})(module);
