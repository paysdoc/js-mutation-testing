/**
 * This registry contains all the possible mutation commands and the predicates for which they a command will be selected.
 * It will select and return a command based on the given syntax tree node.
 *
 * To add new commands to the application simply create a new Mutation command based on MutationBaseCommand and add it to the registry together with an appropriate predicate.
 *
 * Created by Martin Koster on 2/20/15.
 */
var _ = require('lodash'),
    ComparisonOperatorCommand = require('mutationCommand/ComparisonOperatorCommand'),
    ArithmeticOperatorCommand = require('mutationCommand/ArithmeticOperatorCommand'),
    ArrayExpressionCommand = require('mutationCommand/ArrayExpressionCommand'),
    BlockStatementCommand = require('mutationCommand/BlockStatementCommand'),
    ObjectCommand = require('mutationCommand/ObjectCommand'),
    LiteralCommand = require('mutationCommand/LiteralCommand'),
    UnaryExpressionCommand = require('mutationCommand/UnaryExpressionCommand'),
    LogicalExpressionCommand = require('mutationCommand/LogicalExpressionCommand'),
    BaseCommand = require('mutationCommand/BaseCommand'),
    CallExpressionCommand = require('mutationCommand/CallExpressionCommand'),
    UpdateExpressionCommand = require('mutationCommand/UpdateExpressionCommand'),
    IterationCommand = require('mutationCommand/IterationCommand'),
    ForLoopCommand = require('mutationCommand/ForLoopCommand'),
    AssignmentExpressionCommand = require('mutationCommand/AssignmentExpressionCommand'),
    ChildNodeFinder = require('nodeFinder/ChildNodeFinder');

/*
 * Add a new command to this registry together with its predicate. It will automatically be included in the system
 */
var registry  = [
    {predicate: function(node) {return node && node.body && _.isArray(node.body);}, Commands: [BlockStatementCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && (node.type === 'WhileStatement' || node.type === 'DoWhileStatement');}, Commands: [IterationCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'ForStatement';}, Commands: [ForLoopCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'AssignmentExpression';}, Commands: [AssignmentExpressionCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'CallExpression';}, Commands: [CallExpressionCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'ObjectExpression';}, Commands: [ObjectCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'ArrayExpression';}, Commands: [ArrayExpressionCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'BinaryExpression' && isArithmeticExpression(node);}, Commands: [ArithmeticOperatorCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'BinaryExpression' && !isArithmeticExpression(node);}, Commands: [ComparisonOperatorCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'UpdateExpression';}, Commands: [UpdateExpressionCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'Literal';}, Commands: [LiteralCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'UnaryExpression';}, Commands: [UnaryExpressionCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return node && node.type === 'LogicalExpression';}, Commands: [LogicalExpressionCommand], nodeFinder: ChildNodeFinder},
    {predicate: function(node) {return _.isObject(node);}, Commands: [BaseCommand], nodeFinder: ChildNodeFinder}
];

function isArithmeticExpression(node) {
    return _.indexOf(['+', '-', '*', '/', '%'], node.operator) > -1;
}

(function CommandRegistry(exports) {

    /**
     * Selectes a command based on the given Abstract Syntax Tree node.
     * @param {object} node the node for which to return a mutation command
     * @returns {object} The command to be executed for this node
     */
    function selectCommand(node) {
        var commandRegistryItem = _.find(registry, function(registryItem) {
            return !!registryItem.predicate(node);
        });
        return commandRegistryItem ? commandRegistryItem.Command : null;
    }

    /**
     * returns the command codes of all available mutation commands
     * @returns {[string]} a list of mutation codes
     */
    function getAllCommandCodes() {
        return _.keys(getDefaultExcludes());
    }

    /**
     * returns the default exclusion status of each mutation command
     * @returns {object} a list of mutation codes [key] and whether or not they're excluded [value]
     */
    function getDefaultExcludes() {
        var excludes = {};
        _.forEach(_.pluck(registry, 'Command'), function(Command){
            if(Command.code) {
                excludes[Command.code] = !!Command.exclude;
            }
        });
        return excludes;
    }

    exports.selectCommand = selectCommand;
    exports.getAllCommandCodes = getAllCommandCodes;
    exports.getDefaultExcludes = getDefaultExcludes;
})(module.exports);
