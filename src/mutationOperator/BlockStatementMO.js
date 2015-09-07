/**
 * This command creates mutations on a given array of statements in a statement block
 * Created by Martin Koster on 2/12/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationUtils = require('../utils/MutationUtils'),
        MutationOperator = require('./MutationOperator');

    function BlockStatementMO (astNode, index) {
        MutationOperator.call(this, astNode);
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

    BlockStatementMO.prototype.getReplacement = function() {
        return null;
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
