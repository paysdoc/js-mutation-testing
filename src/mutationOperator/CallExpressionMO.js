/**
 * This command creates mutations on the parameters of a function call.
 * Please note: any parameters that are actually literals are processed via the MutateLiteralCommand
 *
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

    function CallExpressionPropertyMO (astNode, mutatee, replacement, index) {
        MutationOperator.call(this, astNode);
        this._index = index;
        this._mutatee = mutatee;
        this._replacement = replacement;
    }

    CallExpressionPropertyMO.prototype.apply = function() {
        var executor = executors[this._mutatee];

        if (executor && !this._original) {
            return executor[0].call(this);
        } 
    };

    CallExpressionPropertyMO.prototype.revert = function() {
        var executor = executors[this._mutatee];
        if (this._original && executor) {
            executor[1].call(this);
            this._original = null;
        }
    };

    CallExpressionPropertyMO.prototype.getReplacement = function() {
        return this._replacement.value;
    };

    function mutateArgs() {
        var i = this._index,
            args = this._astNode['arguments'],
            mutation;

        this._original = args[i];
        mutation = MutationUtils.createMutation(args[i], args[i].range[1], this._original, this._replacement.value);
        args[i] = this._replacement;
        return mutation;
    }

    function restoreArgs() {
        this._astNode['arguments'][this._index] = this._original;
    }

    function mutateSelf() {
        var self = this,
            astNode = this._astNode,
            mutation = MutationUtils.createMutation(astNode, astNode.range[1], this._original, this._replacement);

        this._original = {};
        _.forOwn(astNode, function(value, key) {
            self._original[key] = value;
            delete astNode[key];
        });
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

    module.exports.create = function(astNode) {
        var args = astNode.arguments,
            replacement,
            mos = [];

        _.forEach(args, function(arg, i) {
            replacement = LiteralUtils.determineReplacement(arg.value);
            if (arg.type === 'Literal' && !!replacement) {
                mos.push(new CallExpressionPropertyMO(astNode, 'arguments', replacement, i));
                // we have found a literal mutation for given argument, so we don't need to mutate more
                return mos;
            }
            mos.push(new CallExpressionPropertyMO(astNode, 'arguments', {type: 'Literal', value: 'MUTATION!', raw:'\'MUTATION!\''}, i));
        });

        if (args.length === 1) {
            mos.push(new CallExpressionPropertyMO(astNode, 'self', args[0]));
        }

        if (astNode.callee.type === 'MemberExpression') {
            mos.push(new CallExpressionPropertyMO(astNode, 'self', astNode.callee.object));
        }

        return mos;
    };
    module.exports.code = 'METHOD_CALL';
})(module);
