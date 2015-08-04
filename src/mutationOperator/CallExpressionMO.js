/**
 * This command creates mutations on the parameters of a function call.
 * Please note: any parameters that are actually literals are processed via the MutateLiteralCommand
 *
 * TODO test this well!!
 * Created by Martin Koster on 2/16/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        MutationOperator = require('./MutationOperator'),
        MutationUtils = require('../utils/MutationUtils'),
        LiteralUtils = require('../utils/LiteralUtils');

    var executors = {
        'arguments' : [mutateArgs, restoreArgs],
        'self' : [mutateSelf, restoreSelf]
    };

    function CallExpressionPropertyMO (subTree, mutatee, replacement, index) {
        MutationOperator.call(this, subTree);
        this._index = index;
        this._mutatee = mutatee;
        this._replacement = replacement;
    }

    CallExpressionPropertyMO.prototype.apply = function() {
        var executor = executors[this._mutatee];
        
        if (executor && !this._original) {
            return executor ? executor[0](this) : null;
        } 
    };

    CallExpressionPropertyMO.prototype.revert = function() {
        var executor = executors[this._mutatee];
        if (this._original && executor) {
            executor[1](this);
            this._original = null;
        }
    };
    
    function mutateArgs(ctx) {
        var i = ctx._index,
            args = ctx._astNode['arguments'];

        ctx._original = args[i];
        args[i] = ctx._replacement;
        return MutationUtils.createMutation(args[i], args[i].range[1], ctx._original, ctx._replacement);
    }

    function restoreArgs(ctx) {
        ctx._astNode['arguments'][ctx._index] = ctx._original;
    }

    function mutateSelf(ctx) {
        var astNode = ctx._astNode,
            mutation = MutationUtils.createMutation(astNode, astNode.range[1], ctx._original, ctx._replacement);

        ctx._original = {};
        _.forOwn(astNode, function(value, key) {
            ctx._original[key] = value;
            delete astNode[key];
        });
        _.forOwn(ctx._replacement, function(value, key) {
            astNode[key] = value;
        });

        return mutation;
    }

    function restoreSelf(ctx) {
        var astNode = ctx._astNode;
        
        _.forOwn(astNode, function(value, key) {
            delete astNode[key];
        });
        _.forOwn(ctx._original, function(value, key) {
            astNode[key] = value;
        });
    }

    module.exports.create = function(subTree) {
        var args = subTree.arguments,
            replacement,
            mos = [];

        _.forEach(args, function(arg, i) {
            replacement = LiteralUtils.determineReplacement(arg.value);
            if (arg.type === 'Literal' && !!replacement) {
                mos.push(new CallExpressionPropertyMO(subTree, 'arguments', replacement, i));
                // we have found a literal mutation for given argument, so we don't need to mutate more
                return mos;
            }
            mos.push(new CallExpressionPropertyMO(subTree, 'arguments', 'MUTATION!', i));
        });

        if (args.length === 1) {
            mos.push(new CallExpressionPropertyMO(subTree, 'self', args[0]));
        }

        if (subTree.callee.type === 'MemberExpression') {
            mos.push(new CallExpressionPropertyMO(subTree, 'self', subTree.callee.object));
        }

        return mos;
    };
    module.exports.code = 'METHOD_CALL';
})(module);
