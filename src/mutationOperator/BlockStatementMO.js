/**
 * This command creates mutations on a given array of statements in a statement block
 * Created by Martin Koster on 2/12/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationUtils = require('../utils/MutationUtils'),
        MutationOperator = require('./MutationOperator');

    function BlockStatementMO (subTree, index) {
        MutationOperator.call(this, subTree);
        this._index = index;
    }

    BlockStatementMO.prototype.apply = function () {
        var astNode = this._astNode,
            mutation;

        if (!this._original) {
            this._original = astNode.splice(this._index, 1)[0];
            mutation = MutationUtils.createMutation(this._original, this._original.range[1], this._original);
        }

        return mutation;
    };

    BlockStatementMO.prototype.revert = function() {
        if (this._original) {
            this._astNode.splice(this._index, 0, this._original);
        }
        this._original = null;
    };

    module.exports.create = function(subTree) {
        var mos = [],
            nodeBody = subTree.node.body || [];

        _.forEach(nodeBody, function (childNode, i) {
            mos.push(new BlockStatementMO(subTree, i));
        });

        return mos;
    };
    module.exports.code = 'BLOCK_STATEMENT';
})(module);
