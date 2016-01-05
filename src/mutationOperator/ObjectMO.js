/**
 * This command creates mutations on a given object
 * Created by Martin Koster on 2/12/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationOperator = require('./MutationOperator'),
        ArrayMutatorUtil = require('../utils/ArrayMutatorUtil'),
        MutationUtils = require('../utils/MutationUtils');

    var code = 'OBJECT';
    function ObjectMO (astNode, index) {
        MutationOperator.call(this, astNode);
        this.code = code;
        this._original = this._astNode.properties[index];
        this._originalArray = _.clone(this._astNode.properties);
    }

    ObjectMO.prototype.apply = function () {
        function createMutationInfo(element) {
            return MutationUtils.createMutation(element, element.range[1], element);
        }
        return ArrayMutatorUtil.removeElement(this._astNode.properties, this._original, createMutationInfo);
    };

    ObjectMO.prototype.revert = function() {
        ArrayMutatorUtil.restoreElement(this._astNode.properties, this._original, this._originalArray);
    };

    ObjectMO.prototype.getReplacement = function() {
        var property = this._original;

        return {
            value: null,
            begin: property.range[0],
            end: property.range[1]
        };
    };

    module.exports.create = function(astNode){
        var properties = astNode.properties,
            mos = [];

        _.forEach(properties, function(property, i) {
            if (property.kind === 'init') {
                mos.push(new ObjectMO(astNode, i));
            }
        });

        return mos;
    };
    module.exports.code = code;
})(module);
