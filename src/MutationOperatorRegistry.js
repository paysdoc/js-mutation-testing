/**
 * This registry contains all the possible mutation commands and the predicates for which they a command will be selected.
 * It will select and return a command based on the given syntax tree node.
 *
 * To add new commands to the application simply create a new Mutation command based on BaseMutationOperator and add it to the registry together with an appropriate predicate.
 *
 * Created by Martin Koster on 2/20/15.
 */
(function MutationOperatorRegistry(exports) {
    'use strict';

    var _ = require('lodash'),
        ComparisonOperatorMO = require('./mutationOperator/ComparisonOperatorMO'),
        EqualityOperatorMO = require('./mutationOperator/EqualityOperatorMO'),
        ArithmeticOperatorMO = require('./mutationOperator/ArithmeticOperatorMO'),
        ArrayExpressionMO = require('./mutationOperator/ArrayExpressionMO'),
        BlockStatementMO = require('./mutationOperator/BlockStatementMO'),
        ObjectMO = require('./mutationOperator/ObjectMO'),
        LiteralMO = require('./mutationOperator/LiteralMO'),
        UnaryExpressionMO = require('./mutationOperator/UnaryExpressionMO'),
        LogicalExpressionMO = require('./mutationOperator/LogicalExpressionMO'),
        CallExpressionMO = require('./mutationOperator/CallExpressionMO'),
        UpdateExpressionMO = require('./mutationOperator/UpdateExpressionMO'),
        ArrayCNF = require('./childNodeFinder/ArrayCNF'),
        CallExpressionCNF = require('./childNodeFinder/CallExpressionCNF'),
        ChildNodeFinder = require('./childNodeFinder/ChildNodeFinder'),
        ForLoopCNF = require('./childNodeFinder/ForLoopCNF'),
        IterationCNF = require('./childNodeFinder/IterationCNF'),
        LeftRightCNF = require('./childNodeFinder/LeftRightCNF'),
        PropertyCNF = require('./childNodeFinder/PropertyCNF');

    /*
     * Add a new command to this registry together with its predicate. It will automatically be included in the system
     */
    var registry  = [
        {// block statement: { var i; var j; }
            predicate: function (node) {return node && node.body && _.isArray(node.body);},
            MutationOperators: [BlockStatementMO],
            childNodeFinder: {type: ArrayCNF}
        },
        {// while / do ... while loop
            predicate: function (node) {return node && (node.type === 'WhileStatement' || node.type === 'DoWhileStatement');},
            MutationOperators: [],
            childNodeFinder: {type: IterationCNF}
        },
        {// for loop
            predicate: function (node) {return node && node.type === 'ForStatement';},
            MutationOperators: [],
            childNodeFinder: {type: ForLoopCNF}
        },
        {// assignment expression: a = 'apple';
            predicate: function (node) {return node && node.type === 'AssignmentExpression';},
            MutationOperators: [],
            childNodeFinder: {type: ChildNodeFinder}
        },
        {// call expression: callingSomeFunction(param1, param2);
            predicate: function (node) {return node && node.type === 'CallExpression';},
            MutationOperators: [CallExpressionMO],
            childNodeFinder: {type: CallExpressionCNF}
        },
        {// object expression: {item1: 'item1'}
            predicate: function (node) {return node && node.type === 'ObjectExpression';},
            MutationOperators: [ObjectMO],
            childNodeFinder: {type: PropertyCNF}
        },
        {// array expression ['a', 'b', 'c']
            predicate: function (node) {return node && node.type === 'ArrayExpression';},
            MutationOperators: [ArrayExpressionMO],
            childNodeFinder: {type: ArrayCNF, property: 'element'}
        },
        {// binary expression
            predicate: function (node) {return node && node.type === 'BinaryExpression';},
            MutationOperators: [ArithmeticOperatorMO, ComparisonOperatorMO, EqualityOperatorMO],
            childNodeFinder: {type: LeftRightCNF}
        },
        {// update expression: i++
            predicate: function (node) {return node && node.type === 'UpdateExpression';},
            MutationOperators: [UpdateExpressionMO],
            childNodeFinder: null
        },
        {// literal
            predicate: function (node) {return node && node.type === 'Literal';},
            MutationOperators: [LiteralMO],
            childNodeFinder: null
        },
        {// unary expression: '-' as in -x
            predicate: function (node) {return node && node.type === 'UnaryExpression';},
            MutationOperators: [UnaryExpressionMO],
            childNodeFinder: null
        },
        {// logical expression: a && b
            predicate: function (node) {return node && node.type === 'LogicalExpression';},
            MutationOperators: [LogicalExpressionMO],
            childNodeFinder: {type: LeftRightCNF}
        },
        {// default for all AST node objects
            predicate: function (node) {return _.isObject(node);},
            MutationOperators: [],
            childNodeFinder: {type: ChildNodeFinder}
        }
    ];

    /**
     * Selectes a set of mutation operators based on the given Abstract Syntax Tree node.
     * @param {object} astNode the node for which to return a mutation command
     * @param {object} mutationOperationWarden the object guarding the status of each mutation operation
     * @returns {object} The mutation operators to be applied for this astNode
     */
    function selectMutationOperators(astNode, mutationOperationWarden) {
        var registryItem = _.find(registry, function (registryItem) {
                return !!registryItem.predicate(astNode);
            }),
            result = {included: [], excluded: [], ignored: []};

        _.forEach((registryItem && registryItem.MutationOperators) || [], function(MutationOperator) {
            var operators = MutationOperator.create(astNode);

            _.forEach(operators, function(operator) {
                var replacement = operator.getReplacement(),
                    status = mutationOperationWarden.getMOStatus(astNode, operator, MutationOperator.code);

                if (status === 'ignore') {
                    result.ignored.push([replacement.begin, replacement.end]);
                } else if (status === 'exclude') {
                    result.excluded.push(astNode.range);
                } else {
                    result.included.push(operator);
                }
            }, this);
        });
        return result;
    }

    /**
     * Selects the child node finder for the given Abstract Syntax Tree node.
     * @param {object} node the node for which to return a mutation command
     * @returns {object} The child node finder
     */
    function selectChildNodeFinder(node) {
        var matchingItem = _.find(registry, function (registryItem) {
                return !!registryItem.predicate(node);
            }),
            childNodeFinder = matchingItem && matchingItem.childNodeFinder;

        return !!(childNodeFinder) ? new childNodeFinder.type(node, childNodeFinder.property) : null;
    }

    /**
     * returns the command codes of all available mutation commands
     * @returns {[string]} a list of mutation codes
     */
    function getAllMutationCodes() {
        return _.pluck(getMutationOperatorTypes(), 'code');
    }

    /**
     * returns the mutation types currently registered
     * @returns {Array}
     */
    function getMutationOperatorTypes() {
        return _.uniq(_.flatten(_.pluck(registry, 'MutationOperators'), true));
    }

    exports.selectMutationOperators = selectMutationOperators;
    exports.selectChildNodeFinder = selectChildNodeFinder;
    exports.getAllMutationCodes = getAllMutationCodes;
    exports.getMutationOperatorTypes = getMutationOperatorTypes;
})(module.exports);
