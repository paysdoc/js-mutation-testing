/**
 * Specification for the Mutation analyser
 * @author Martin Koster [paysdoc@gmail.com], created on 01/09/15.
 *
 * Licensed under the MIT license.
 */
describe('MutationAnalyser', function() {
    var proxyquire = require('proxyquire'),
        JSParserWrapper = require('../../src/JSParserWrapper'),
        MutationOperatorRegistry = require('../../src/MutationOperatorRegistry'),
        BlockStatementMO = require('../../src/mutationOperator/BlockStatementMO'),
        ArithmeticOperatorMO = require('../../src/mutationOperator/ArithmeticOperatorMO'),
        LiteralMO = require('../../src/mutationOperator/LiteralMO'),
        MutationConfiguration = require('../../src/MutationConfiguration'),
        src = '\'use strict\'; var x = function() {return x + 1;}',
        ast, mutationAnalyser, getMOStatusSpy,
        selectMutationOperatorsSpy, selectChildNodeFinderSpy;

    var mockWarden = {
        getMOStatus: function(node, mutationOperator, MOCode) {
            if (MOCode === 'BLOCK_STATEMENT') {
                return 'exclude';
            } else if (node.range[0] === 0 && node.range[1] === 12) {
                return 'ignore';
            }
            return 'include';
        }
    };

    beforeEach(function() {
        var MutationAnalyser;

        ast = JSParserWrapper.parse(src, {loc: false});
        jasmine.addMatchers(require('../util/JasmineCustomMatchers'));

        getMOStatusSpy = spyOn(mockWarden, 'getMOStatus').and.callThrough();
        selectMutationOperatorsSpy = spyOn(MutationOperatorRegistry, 'selectMutationOperators').and.callThrough();
        selectChildNodeFinderSpy = spyOn(MutationOperatorRegistry, 'selectChildNodeFinder').and.callThrough();
        MutationAnalyser = proxyquire('../../src/MutationAnalyser', {
            './MutationOperatorRegistry': MutationOperatorRegistry
        });
        mutationAnalyser = new MutationAnalyser(ast);
    });

    it('finds all eligible mutation operators in the given AST', function() {
        var mutationOperatorSets = mutationAnalyser.collectMutations(mockWarden);
        expect(mutationOperatorSets.length).toEqual(2);
        expect(selectMutationOperatorsSpy.calls.count()).toBe(45);
        expect(getMOStatusSpy.calls.count()).toBe(6);

        //if we call collect again the mutation collection should have been cached and returned => ExclusionSpy.getExclusions should not have been called any more times
        mutationAnalyser.collectMutations(mockWarden);
        expect(selectMutationOperatorsSpy.calls.count()).toBe(45);
        expect(getMOStatusSpy.calls.count()).toBe(6);
        expect(mutationAnalyser.getMutationOperators()).toBe(mutationOperatorSets);
        expect(mutationAnalyser.getIgnored()).toEqual([[0, 12]]);
        expect(mutationAnalyser.getExcluded()).toEqual([[ 0, 48 ], [ 0, 48 ], [ 33, 48 ]]);
    });
});