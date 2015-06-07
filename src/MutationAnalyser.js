/**
 * Collects mutations by analysing the given code
 *
 * @author Martin Koster, created on on 6/7/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var esprima = require('esprima'),
        escodegen = require('escodegen'),
        _ = require('lodash'),
        ExclusionUtils = require('../utils/ExclusionUtils'),
        MutationOperatorRegistry = require('./MutationOperatorRegistry');

    function Mutator(src, options) {
        var ast = esprima.parse(src, _.merge({range: true, loc: true, tokens: true, comment: true}, options));
        this._src = src;
        this._ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
    }

    /**
     * collects mutation operators for the given code
     * @param excludeMutations mutation (operators) to exclude
     * @returns {Array} list of mutation operators that can be applied to this code
     */
    Mutator.prototype.collectMutations = function(excludeMutations) {
        var globalExcludes = _.merge(MutationOperatorRegistry.getDefaultExcludes(), excludeMutations),
            tree = {node: this._ast, parentMutationId: _.uniqueId()},
            mutationOperators = [];

        function forEachMutation(subtree) {
            var astNode = subtree.node,
                childNodeFinder;

            if (astNode) {
                mutationOperators.push.apply(MutationOperatorRegistry.selectMutationOperators(astNode));
                childNodeFinder = MutationOperatorRegistry.selectAllChildren(astNode);
            }
            if (childNodeFinder) {
                _.forEach(childNodeFinder.find, function(childNode) {
                    mutationOperators.push.apply(forEachMutation(childNode));
                });
            }
        }

        tree.excludes = _.merge({}, globalExcludes, ExclusionUtils.getExclusions(tree.node)); // add top-level local excludes
        forEachMutation(tree, []);

        return mutationOperators;
    };

    module.exports = Mutator;
})(module);
