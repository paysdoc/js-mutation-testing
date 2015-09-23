/**
 * Utility for creating a mutation object
 * Created by Martin Koster on 2/16/15.
 */
var _ = require('lodash'),
    JSParserWrapper = require('../JSParserWrapper');

(function(module){
    'use strict';

    var createMutation = function (astNode, endOffset, original, replacement) {
        replacement = replacement || '';
        return {
            range: astNode.range,
            begin: astNode.range[0],
            end: endOffset,
            line: astNode.loc.start.line,
            col: astNode.loc.start.column,
            original: _.isObject(original) ? JSParserWrapper.stringify(original) : original,
            replacement: replacement
        };
    };

    var createUnaryOperatorMutation = function (astNode, original, replacement) {
        var mutation = createMutation(astNode, astNode.range[0]+1, original, replacement);
        return _.merge(mutation, {
            line: astNode.loc.end.line,
            col: astNode.loc.end.column
        });
    };

    var createOperatorMutation = function (astNode, original, replacement) {
        var mutation = createMutation(astNode, astNode.right.range[0], original, replacement);
        return _.merge(mutation, {
            begin: astNode.left.range[1],
            line: astNode.loc.end.line,
            col: astNode.loc.end.column
        });
    };

    module.exports.createMutation = createMutation;
    module.exports.createOperatorMutation = createOperatorMutation;
    module.exports.createUnaryOperatorMutation = createUnaryOperatorMutation;
})(module);
