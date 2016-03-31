/**
 * Collects mutations by analysing the given code
 *
 * @author Martin Koster, created on on 6/7/15.
 * Licensed under the MIT license.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationOperatorRegistry = require('./MutationOperatorRegistry'),
        LoopInvariantInstrumenter = require('./instrumenter/LoopInvariantInstrumenter'),
        log4js = require('log4js');

    function MutationAnalyser(ast, config) {
        this._ast = ast;
        this._config = config;
        this._mutationOperatorSets = [];
        this._ignored = [];
        this._excluded = [];
    }

    /**
     * collects mutation operators for the given code
     * @param moWarden the mutation operator warden that guards the status of a mutation operator
     * @returns {Array} list of mutation operators that can be applied to this code
     */
    MutationAnalyser.prototype.collectMutations = function(moWarden) {
        var mutationOperatorSets = this._mutationOperatorSets,
            ignoredMOs = this._ignored,
            excludedMOs = this._excluded,
            maxIterations = this._config.get('maxIterations');

        function analyseNode(astNode) {
            var selectedMutationOperators,
                childNodeFinder;

            if (astNode) {
                selectedMutationOperators = MutationOperatorRegistry.selectMutationOperators(astNode, moWarden);
                Array.prototype.push.apply(mutationOperatorSets, selectedMutationOperators.included); //using push.apply to push array content instead of whole array (which can be empty)
                Array.prototype.push.apply(ignoredMOs, selectedMutationOperators.ignored);
                Array.prototype.push.apply(excludedMOs, selectedMutationOperators.excluded);
                childNodeFinder = MutationOperatorRegistry.selectChildNodeFinder(astNode);
                if (childNodeFinder) {
                    _.forEach(childNodeFinder.find(), function (childNode) {
                        analyseNode(childNode);
                    });
                }

                LoopInvariantInstrumenter.doInstrumentation(astNode, maxIterations);
            }
        }

        if (mutationOperatorSets && mutationOperatorSets.length) {
            return this._mutationOperatorSets;
        }

        analyseNode(this._ast);
        this._mutationOperatorSets = _.map(mutationOperatorSets, function(mutationOperator) {
            return [mutationOperator]; //add operator as single-element array as the rest of the system considers the result to be a list of mutation operator sets (actual implementation will follow)
        });
        return this._mutationOperatorSets;
    };

    MutationAnalyser.prototype.getMutationOperators = function() {
        return this._mutationOperatorSets;
    };

    MutationAnalyser.prototype.getIgnored = function() {
        return this._ignored;
    };

    MutationAnalyser.prototype.getExcluded = function() {
        return this._excluded;
    };

    module.exports = MutationAnalyser;
})(module);
