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

    CallExpressionPropertyMO.prototype.execute = function() {
        var executor = executors[this._mutatee];
        
        if (executor && !this._original) {
            return executor ? executor[1].call(this) : null;
        } 
    };

    CallExpressionPropertyMO.prototype.unExecute = function() {
        var executor = executors[this._mutatee];
        if (this._original && executor) {
            executor.call(this);
            this._original = null;
        }
    };
    
    function mutateArgs() {
        var i = this._index,
            args = this._astNode['arguments'];

        this._original = args[i];
        args[i] = this._replacement;
        return MutationUtils.createMutation(args[i], args[i].range[1], this._original, this._replacement);
    }

    function restoreArgs() {
        this._astNode['arguments'][this._index] = this._original;
    }

    function mutateSelf() {
        var astNode = this._astNode,
            mutation = MutationUtils.createMutation(astNode, astNode.range[1], this._original, this._replacement);

        this._original = {};
        _.forOwn(astNode, function(value, key) {
            this._original[key] = value;
            delete astNode[key];
        }, this);
        _.forOwn(this._replacement, function(value, key) {
            astNode[key] = value;
        });

        return mutation;
    }

    function restoreSelf() {
        var astNode = this._astNode;
        
        _.forOwn(astNode, function(value, key) {
            delete astNode[key];
        });
        _.forOwn(this._original, function(value, key) {
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
                mos.push(new CallExpressionMO(subTree, 'arguments', replacement, i));
                // we have found a literal mutation for this argument, so we don't need to mutate more
                return mos;
            }
            mos.push(new CallExpressionMO(subTree, 'arguments', 'MUTATION!', i));
        });

        if (args.length === 1) {
            mos.push(new CallExpressionMO(subTree, 'self', args[0]));
        }

        if (subTree.callee.type === 'MemberExpression') {
            mos.push(new CallExpressionMO(subTree, 'self', astNode.callee.object));
        }

        return mos;
    };
    module.exports.code = 'METHOD_CALL';
})(module);
