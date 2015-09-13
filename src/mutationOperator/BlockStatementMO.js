/**
 * This command creates mutations on a given array of statements in a statement block
 * Created by Martin Koster on 2/12/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationUtils = require('../utils/MutationUtils'),
        ArrayMutatorUtil = require('../utils/ArrayMutatorUtil'),
        MutationOperator = require('./MutationOperator');

    function BlockStatementMO (astNode, index) {
        MutationOperator.call(this, astNode);
        this._originalArray = _.clone(this._astNode);
        this._original = this._astNode[index];
    }

    BlockStatementMO.prototype.apply = function () {
        function createMutationInfo(element) {
            return MutationUtils.createMutation(element, element.range[1], element);
        }
        return ArrayMutatorUtil.removeElement(this._astNode, this._original, createMutationInfo);
    };

    BlockStatementMO.prototype.revert = function() {
        ArrayMutatorUtil.restoreElement(this._astNode, this._original, this._originalArray);
    };

    BlockStatementMO.prototype.getReplacement = function() {
        var element =  this._original;

        return {
            value: null,
            begin: element.range[0],
            end: element.range[1]
        };
    };

    module.exports.create = function(astNode) {
        var mos = [],
            nodeBody = astNode.body || [];

        _.forEach(nodeBody, function (childNode, i) {
            mos.push(new BlockStatementMO(astNode, i));
        });

        return mos;
    };
    module.exports.code = 'BLOCK_STATEMENT';
})(module);
