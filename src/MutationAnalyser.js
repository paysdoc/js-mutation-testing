/**
 * Collects mutations by analysing the given code
 *
 * @author Martin Koster, created on on 6/7/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationOperatorRegistry = require('./MutationOperatorRegistry');

    function MutationAnalyser(ast) {
        this._ast = ast;
        this._mutationOperators = [];
        this._ignored = [];
        this._excluded = [];
    }

    /**
     * collects mutation operators for the given code
     * @param moWarden the mutation operator warden that guards the status of a mutation operator
     * @returns {Array} list of mutation operators that can be applied to this code
     */
    MutationAnalyser.prototype.collectMutations = function(moWarden) {
        var mutationOperators = this._mutationOperators,
            ignoredMOs = this._ignored,
            excludedMOs = this._excluded;

        function analyseNode(astNode) {
            var selectedMutationOperators,
                childNodeFinder;

            if (astNode) {

                selectedMutationOperators = MutationOperatorRegistry.selectMutationOperators(astNode, moWarden);
                Array.prototype.push.apply(mutationOperators, selectedMutationOperators.included); //using push.apply to push array content instead of whole array
                Array.prototype.push.apply(ignoredMOs, selectedMutationOperators.ignored);
                Array.prototype.push.apply(excludedMOs, selectedMutationOperators.excluded);
                childNodeFinder = MutationOperatorRegistry.selectChildNodeFinder(astNode);
            }
            if (childNodeFinder) {
                _.forEach(childNodeFinder.find(), function (childNode) {
                    analyseNode(childNode);
                });
            }
        }

        if (!(mutationOperators && mutationOperators.length)) {
            analyseNode(this._ast);
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
