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

    function MutationAnalyser(ast, config) {
        this._ast = ast;
        this._config = config;
        this._mutationOperators = [];
        this._ignored = [];
        this._excluded = [];
    }

    /**
     * collects mutation operators for the given code
     * @param excludeMutations mutation (operators) to exclude
     * @returns {Array} list of mutation operators that can be applied to this code
     */
    MutationAnalyser.prototype.collectMutations = function(excludeMutations) {
        var mutationOperators = this._mutationOperators,
            ignoredMOs = this._ignored,
            excludedMOs = this._excluded,
            config = this._config,
            tree = {node: this._ast},
            globalExcludes = _.merge(MutationOperatorRegistry.getDefaultExcludes(), excludeMutations);

        function analyseNode(subTree) {
            var astNode = subTree.node,
                selectedMutationOperators,
                childNodeFinder;

            if (astNode) {

                selectedMutationOperators = MutationOperatorRegistry.selectMutationOperators(subTree, globalExcludes, config);
                Array.prototype.push.apply(mutationOperators, selectedMutationOperators.included); //using push.apply to push array content instead of whole array
                Array.prototype.push.apply(ignoredMOs, selectedMutationOperators.ignored);
                Array.prototype.push.apply(excludedMOs, selectedMutationOperators.excluded);
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

    MutationAnalyser.prototype.getMutationOperators = function() {
        return this._mutationOperators;
    };

    MutationAnalyser.prototype.getIgnored = function() {
        return this._ignored;
    };

    MutationAnalyser.prototype.getExcluded = function() {
        return this._excluded;
    };

    module.exports = MutationAnalyser;
})(module);
