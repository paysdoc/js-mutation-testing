/**
 * Utility for creating a mutation object
 * Created by Martin Koster on 2/16/15.
 */
var _ = require('lodash'),
    escodegen = require('escodegen');

var createMutation = function (astNode, endOffset, original, replacement) {
    replacement = replacement || '';
    return {
        range: astNode.range,
        begin: astNode.range[0],
        end: endOffset,
        line: astNode.loc.start.line,
        col: astNode.loc.start.column,
        original: _.isObject(original) ? escodegen.generate(original) : original,
        replacement: replacement
    };
};

var createAstArrayElementDeletionMutation = function (astArray, elementIndex) {
    var endOffset = (elementIndex === astArray.length - 1) ? // is last element ?
        astArray[elementIndex].range[1] :                     // handle last element
        astArray[elementIndex + 1].range[0];   // care for commas by extending to start of next element
    return createMutation(astArray[elementIndex], endOffset, astArray[elementIndex]);
};

var createOperatorMutation = function (astNode, original, replacement) {
    var mutation = createUnaryOperatorMutation(astNode, astNode.right.range[0], original, replacement);
    return _.merge(mutation, {
        begin: astNode.left.range[1],
        line: astNode.loc.end.line,
        col: astNode.loc.end.column
    });
};
var createUnaryOperatorMutation = function (astNode, original, replacement) {
    var mutation = createMutation(astNode, astNode.range[0]+1, original, replacement);
    return _.merge(mutation, {
        line: astNode.loc.end.line,
        col: astNode.loc.end.column
    });
};

module.exports.createMutation = createMutation;
module.exports.createAstArrayElementDeletionMutation = createAstArrayElementDeletionMutation;
module.exports.createOperatorMutation = createOperatorMutation;
module.exports.createUnaryOperatorMutation = createUnaryOperatorMutation;
