/**
 * Collects mutations by analysing the given code
 *
 * @author Martin Koster, created on on 6/7/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        ExclusionUtils = require('./utils/ExclusionUtils'),
        MutationOperatorRegistry = require('./MutationOperatorRegistry');

    function Mutator(ast, config) {
        this._ast = ast;
        this._config = config;
        this._mutationOperators = [];
    }

    /**
     * collects mutation operators for the given code
     * @param excludeMutations mutation (operators) to exclude
     * @returns {Array} list of mutation operators that can be applied to this code
     */
    Mutator.prototype.collectMutations = function(excludeMutations) {
        var mutationOperators = this._mutationOperators,
            config = this._config,
            tree = {node: this._ast},
            globalExcludes = _.merge(MutationOperatorRegistry.getDefaultExcludes(), excludeMutations);

        function analyseNode(subTree) {
            var astNode = subTree.node,
                selectedMutationOperators,
                childNodeFinder;

            if (astNode) {
                selectedMutationOperators = MutationOperatorRegistry.selectMutationOperators(subTree, globalExcludes, config);
                Array.prototype.push.apply(mutationOperators, selectedMutationOperators.included);
                childNodeFinder = MutationOperatorRegistry.selectChildNodeFinder(astNode);
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

    module.exports = Mutator;
})(module);
