/**
 * Spec for the utility handling the exclusion of mutation operators
 * @author Martin Koster [paysdoc@gmail.com], created on 24/09/15.
 * Licensed under the MIT license.
 */
describe('ExclusionUtils', function() {
    var proxyquire = require('proxyquire'),
        JSParserWrapper = require('../../../src/JSParserWrapper'),
        ExclusionUtils, loggerSpy;

    function findNodeWithExclusion(node) {
        /**
         * @excludeMutations #params
         */
        return node.body[0].body.body[0];
    }

    beforeEach(function() {
        loggerSpy = jasmine.createSpyObj('logger', ['warn']);
        ExclusionUtils = proxyquire('../../../src/utils/ExclusionUtils', {
            'log4js': {getLogger: function() {return loggerSpy}}
        });
    });

    it('excludes the MATH and OBJECT mutators as specified in a block comment of the given node', function() {
        var node = JSParserWrapper.parse(findNodeWithExclusion.toString().replace(/#params/, '[\'MATH\', \'OBJECT\']')),
            exclusionNode = findNodeWithExclusion(node); //find the node that actually contains the exclusion comment

        var exclusions = ExclusionUtils.getExclusions(node);
        expect(exclusions).toEqual({});

        exclusions = ExclusionUtils.getExclusions(exclusionNode);
        expect(exclusions).toEqual({MATH: true, OBJECT: true});
    });

    it ('excludes all mutators if no operators are specified', function() {
        var node = JSParserWrapper.parse(findNodeWithExclusion.toString().replace(/#params/, '')),
            exclusionNode = findNodeWithExclusion(node);

        expect(ExclusionUtils.getExclusions(exclusionNode)).toEqual({
            BLOCK_STATEMENT: true,
            METHOD_CALL: true,
            OBJECT: true,
            ARRAY: true,
            MATH: true,
            COMPARISON: true,
            EQUALITY: true,
            UPDATE_EXPRESSION: true,
            LITERAL: true,
            UNARY_EXPRESSION: true,
            LOGICAL_EXPRESSION: true
        });
    });

    it('issues a warning if the comments contain an invalid mutation operator', function() {
        var input = findNodeWithExclusion.toString().replace(/#params/, '[\'INVALID\']');
        ExclusionUtils.getExclusions(findNodeWithExclusion(JSParserWrapper.parse(input)));
        expect(loggerSpy.warn).toHaveBeenCalledWith('Encountered an unknown exclusion: %s', 'INVALID');
    });

    it('excludes the MATH and OBJECT mutators as specified in a block comment of the given node', function() {
        var src = function foo() {
                // @excludeMutations #params
                return {
                    baz: function () {
                        return bar;
                    }
                }
            },
            node = JSParserWrapper.parse(src.toString().replace(/#params/, '[\'LITERAL\']'));

        expect(ExclusionUtils.getExclusions(findNodeWithExclusion(node))).toEqual({LITERAL: true});
    });
});