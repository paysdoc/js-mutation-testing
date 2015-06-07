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
        ComparisonOperatorMO = require('mutationOperator/ComparisonOperatorMO'),
        EqualityOperatorMO = require('mutationOperator/EqualityOperatorMO'),
        ArithmeticOperatorMO = require('mutationOperator/ArithmeticOperatorMO'),
        ArrayExpressionMO = require('mutationOperator/ArrayExpressionMO'),
        BlockStatementMO = require('mutationOperator/BlockStatementMO'),
        ObjectMO = require('mutationOperator/ObjectMO'),
        LiteralMO = require('mutationOperator/LiteralMO'),
        UnaryExpressionMO = require('mutationOperator/UnaryExpressionMO'),
        LogicalExpressionMO = require('mutationOperator/LogicalExpressionMO'),
        CallExpressionMO = require('mutationOperator/CallExpressionMO'),
        UpdateExpressionMO = require('mutationOperator/UpdateExpressionMO'),
        ArrayCNF = require('childNodeFinder/ArrayCNF'),
        CallExpressionCNF = require('childNodeFinder/CallExpressionCNF'),
        ChildNodeFinder = require('childNodeFinder/ChildNodeFinder'),
        ForLoopCNF = require('childNodeFinder/ForLoopCNF'),
        IterationCNF = require('childNodeFinder/IterationCNF'),
        LeftRightCNF = require('childNodeFinder/LeftRightCNF'),
        PropertyCNF = require('childNodeFinder/PropertyCNF');

    /*
     * Add a new command to this registry together with its predicate. It will automatically be included in the system
     */
    var registry  = [
        {// block statement: { var i; var j; }
            predicate: function (node) {return node && node.body && _.isArray(node.body);},
            MutationOperators: [BlockStatementMO],
            childNodeFinder: ArrayCNF
        },
        {// while / do ... while loop
            predicate: function (node) {return node && (node.type === 'WhileStatement' || node.type === 'DoWhileStatement');},
            MutationOperators: [],
            childNodeFinder: IterationCNF
        },
        {// for loop
            predicate: function (node) {return node && node.type === 'ForStatement';},
            MutationOperators: [],
            childNodeFinder: ForLoopCNF
        },
        {// assignment expression: a = 'apple';
            predicate: function (node) {return node && node.type === 'AssignmentExpression';},
            MutationOperators: [],
            childNodeFinder: ChildNodeFinder
        },
        {// call expression: callingSomeFunction(param1, param2);
            predicate: function (node) {return node && node.type === 'CallExpression';},
            MutationOperators: [CallExpressionMO],
            childNodeFinder: CallExpressionCNF
        },
        {// object expression: {item1: 'item1'}
            predicate: function (node) {return node && node.type === 'ObjectExpression';},
            MutationOperators: [ObjectMO],
            childNodeFinder: PropertyCNF
        },
        {// array expression ['a', 'b', 'c']
            predicate: function (node) {return node && node.type === 'ArrayExpression';},
            MutationOperators: [ArrayExpressionMO],
            childNodeFinder: ArrayCNF
        },
        {// arithmetic expression
            predicate: function (node) {return node && node.type === 'BinaryExpression' && isArithmeticExpression(node);},
            MutationOperators: [ArithmeticOperatorMO],
            childNodeFinder: LeftRightCNF
        },
        {// comparison expression
            predicate: function (node) {return node && node.type === 'BinaryExpression' && !isArithmeticExpression(node);},
            MutationOperators: [ComparisonOperatorMO, EqualityOperatorMO],
            childNodeFinder: LeftRightCNF
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
            childNodeFinder: LeftRightCNF
        },
        {// default for all AST node objects
            predicate: function (node) {return _.isObject(node);},
            MutationOperators: [],
            childNodeFinder: ChildNodeFinder
        }
    ];

    function isArithmeticExpression(node) {
        return _.indexOf(['+', '-', '*', '/', '%'], node.operator) > -1;
    }

    /**
     * Selectes a set of mutation operators based on the given Abstract Syntax Tree node.
     * @param {object} node the node for which to return a mutation command
     * @param {object} globalExcludes object containing mutation codes to be excluded across the whole application
     * @returns {object} The mutation operators to be applied for this node
     */
    function selectMutationOperators(node, globalExcludes) {
        var excludes = node.excludes || globalExcludes,
            registryItem = _.find(registry, function (registryItem) {
                return !!registryItem.predicate(node);
            }),
            result = [];

        _.forEach((registryItem && registryItem.MutationOperators) || [], function(MutationOperator) {
            if (!excludes[MutationOperator.code]) {
                result.push.apply(MutationOperator.create(node));
            }
        });
        return result;
    }

    /**
     * Selects the child node finder for the given Abstract Syntax Tree node.
     * @param {object} node the node for which to return a mutation command
     * @returns {object} The child node finder
     */
    function selectChildNodeFinder(node) {
        var registryItem = _.find(registry, function(registryItem) {
            return !!registryItem.predicate(node);
        });
        return registryItem ? registryItem.childNodeFinder : null;
    }

    /**
     * returns the command codes of all available mutation commands
     * @returns {[string]} a list of mutation codes
     */
    function getAllMutationCodes() {
        return _.keys(getDefaultExcludes());
    }

    /**
     * returns the default exclusion status of each mutation command
     * @returns {object} a list of mutation codes [key] and whether or not they're excluded [value]
     */
    function getDefaultExcludes() {
        var excludes = {};
        _.forEach(_.uniq(_.flatten(_.pluck(registry, 'MutationOperators'), true)), function(operator){
            if(operator.code) {
                excludes[operator.code] = !!operator.exclude;
            }
        });
        return excludes;
    }

    exports.selectMutationOperators = selectMutationOperators;
    exports.selectChildNodeFinder = selectChildNodeFinder;
    exports.getAllMutationCodes = getAllMutationCodes;
    exports.getDefaultExcludes = getDefaultExcludes;
})(module.exports);
