/*
 * Collects, locates and applies mutations
 *
 * Copyright (c) 2014 Marco Stahl
 * Licensed under the MIT license.
 */

'use strict';
var esprima = require('esprima'),
    escodegen = require('escodegen'),
    _ = require('lodash'),
    BaseMutationOperator = require('../mutationOperator/BaseMutationOperator'),
    ExclusionUtils = require('../utils/ExclusionUtils'),
    MutationOperatorRegistry = require('./MutationOperatorRegistry'),
    MutationOperatorHandler = require('./MutationOperatorHandler');

function Mutator(src, options) {
    var ast = esprima.parse(src, _.merge({range: true, loc: true, tokens: true, comment: true}, options));
    this._src = src;
    this._ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
    this._brackets = _.filter(esprima.tokenize(src, {range: true}), {"type": "Punctuator", "value": "("});
}

Mutator.prototype.collectMutations = function(excludeMutations) {

    var src = this._src,
        brackets = this._brackets,
        globalExcludes = _.merge(MutationOperatorRegistry.getDefaultExcludes(), excludeMutations),
        tree = {node: this._ast, parentMutationId: _.uniqueId()},
        mutationOperators = [];

    function forEachMutation(subtree, processMutation) {
        var astNode = subtree.node,
            excludes = subtree.excludes || globalExcludes,
            MutationOperator;

        MutationOperator = astNode && MutationOperatorRegistry.selectMutationOperator(astNode);
        if (MutationOperator) {
            if (!excludes[MutationOperator.code]) {
                mutationOperators.push(MutationOperator.create());
                MutationOperator = BaseMutationOperator; //the command code is not included - revert to default command
            }
            _.forEach(MutationOperatorHandler.executeCommand(new MutationOperator(src, subtree, processMutation)),
                function (subTree) {
                    if(subTree.node) {
                        var localExcludes = ExclusionUtils.getExclusions(subTree.node);
                        subTree.excludes = _.merge({}, excludes, localExcludes);
                    }

                    forEachMutation(subTree, processMutation);
                }
            );
        }
    }

    tree.excludes = _.merge({}, globalExcludes, ExclusionUtils.getExclusions(tree.node)); // add top-level local excludes
    forEachMutation(tree, function (mutation) {
        mutationOperators.push(_.merge(mutation, calibrateBeginAndEnd(mutation.begin, mutation.end, brackets)));
    });

    return mutationOperators;
};

Mutator.prototype.applyMutation = function(mutation) {
    var src = this._src;
    return src.substr(0, mutation.begin) + mutation.replacement + src.substr(mutation.end);
};

function calibrateBeginAndEnd(begin, end, brackets) {
    //return {begin: begin, end: end};
    var beginBracket = _.find(brackets, function (bracket) {
            return bracket.range[0] === begin;
        }),
        endBracket = _.find(brackets, function (bracket) {
            return bracket.range[1] === end;
        });

    return {
        begin: beginBracket && beginBracket.value === ')' ? begin + 1 : begin,
        end: endBracket && endBracket.value === '(' ? end - 1 : end
    };
}

module.exports = Mutator;
