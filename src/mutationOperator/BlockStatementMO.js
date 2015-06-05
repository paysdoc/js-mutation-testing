/**
 * This command creates mutations on a given array of statements in a statement block
 * Created by Martin Koster on 2/12/15.
 */
(function(module) {
    'use strict';

    var MutationUtils = require('../utils/MutationUtils'),
        MutationOperator = require('MutationOperator');

    function BlockStatementMO (subTree, index) {
        MutationOperator.call(this, subTree);
        this._index = index;
    }

    BlockStatementMO.prototype.execute = function () {
        var mutation;

        if (!this._original) {
            this._original = this._astNode.splice(this._index, 1)[0];
            mutation = MutationUtils.createMutation(childNode, childNode.range[1], this._parentMutationId);
        }

        return mutation;
    };

    BlockStatementMO.prototype.unExecute = function() {
        if (this._original) {
            this._astNode.splice(this._index, 0, this._original);
        }
        this._original = null;
    };

    module.exports.create = function(subTree) {
        var mos = [];

        this._astNode.forEach(function (childNode, i) {
            mos.push(new BlockStatementMO(subTree, i));
        });

        return mos;
    };
    module.exports.code = 'BLOCK_STATEMENT';
})(module);
