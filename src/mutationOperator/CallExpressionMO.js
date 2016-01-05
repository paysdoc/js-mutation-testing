/**
 * This command creates mutations on the parameters of a function call.
 * Please note: any parameters that are actually literals are processed via the MutateLiteralCommand
 *
 * Created by Martin Koster on 2/16/15.
 */
(function(module) {
    'use strict';

    var _ = require('lodash'),
        LiteralUtils = require('../utils/LiteralUtils'),
        CallExpressionArgsMO = require('./CallExpressionArgsMO'),
        CallExpressionSelfMO = require('./CallExpressionSelfMO');

    var code = 'METHOD_CALL';
    module.exports.create = function(astNode) {
        var args = astNode.arguments,
            replacement,
            mos = [];

        _.forEach(args, function(arg, i) {
            replacement = LiteralUtils.determineReplacement(arg.value);
            if (arg.type === 'Literal' && !!replacement) {
                mos.push(CallExpressionArgsMO.create(astNode, replacement, i));
                // we have found a literal mutation for given argument, so we don't need to mutate more
                return mos;
            }
            mos.push(CallExpressionArgsMO.create(astNode, {type: 'Literal', value: 'MUTATION!', raw:'\'MUTATION!\''}, i));
        });

        if (args.length === 1) {
            mos.push(CallExpressionSelfMO.create(astNode, args[0]));
        }

        if (astNode.callee.type === 'MemberExpression') {
            mos.push(CallExpressionSelfMO.create(astNode, astNode.callee.object));
        }

        return mos;
    };
    module.exports.code = code;
})(module);
