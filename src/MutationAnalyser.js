/**
 * Collects mutations by analysing the given code
 *
 * @author Martin Koster, created on on 6/7/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        ExclusionUtils = require('../utils/ExclusionUtils'),
        MutationOperatorRegistry = require('./MutationOperatorRegistry');

    function Mutator(ast) {
        this._ast = ast;
        this._mutationOperators = [];
        this._excludedOperators = [];
    }

    /**
     * collects mutation operators for the given code
     * @param excludeMutations mutation (operators) to exclude
     * @returns {Array} list of mutation operators that can be applied to this code
     */
    Mutator.prototype.collectMutations = function(excludeMutations) {
        var self = this,
            tree = {node: self._ast},
            globalExcludes = _.merge(MutationOperatorRegistry.getDefaultExcludes(), excludeMutations),
            mutationOperators = this._mutationOperators,
            excludedMutations = this._excludeMutations;

        function analyseNode(subtree) {
            var astNode = subtree.node,
                selectedMutationOperators,
                childNodeFinder;

            if (astNode) {
                selectedMutationOperators = MutationOperatorRegistry.selectMutationOperators(astNode);
                Array.prototype.push.apply(mutationOperators, selectedMutationOperators.operators);
                Array.prototype.push.apply(excludedMutations, selectedMutationOperators.excludes);
                childNodeFinder = MutationOperatorRegistry.selectAllChildren(astNode);
            }
            if (childNodeFinder) {
                _.forEach(childNodeFinder.find(), function (childNode) {
                    analyseNode({
                        node: childNode,
                        excludes: _.merge({}, globalExcludes, ExclusionUtils.getExclusions(childNode))
                    });
                });
            }
        }

        if (!(mutationOperators && mutationOperators.length)) {
            tree.excludes = _.merge({}, globalExcludes, ExclusionUtils.getExclusions(tree.node)); // add top-level local excludes
            analyseNode(tree);
        }

        return mutationOperators;
    };

    Mutator.prototype.getExcludedMutations = function() {
        return this._excludedOperators;
    };

    module.exports = Mutator;
})(module);
