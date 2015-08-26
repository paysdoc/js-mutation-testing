/**
 * This command creates mutations on a given object
 * Created by Martin Koster on 2/12/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationOperator = require('./MutationOperator'),
        MutationUtils = require('../utils/MutationUtils');

    function ObjectMO (astNode, index) {
        MutationOperator.call(this, astNode);
        this._index = index;
    }

    ObjectMO.prototype.apply = function () {
        var properties = this._astNode.properties,
            index = this._index,
            mutation;

        if (!this._original) {
            mutation = MutationUtils.createAstArrayElementDeletionMutation(properties, index);
            this._original = properties.splice(this._index, 1)[0];
        }

        return mutation;
    };

    ObjectMO.prototype.revert = function() {
        if (this._original) {
            this._astNode.properties.splice(this._index, 0, this._original);
            this._original = null;
        }
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
    module.exports.code = 'OBJECT';
})(module);
