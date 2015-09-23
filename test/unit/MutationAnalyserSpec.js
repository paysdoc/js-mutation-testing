/**
 * Specification for the Mutation analyser
 * @author Martin Koster [paysdoc@gmail.com], created on 01/09/15.
 *
 * TODO: currently this unit tests a whole lot of other units indirectly - this requires better mocking and, where applicable, updates to tests of other units
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
        ast, mutationAnalyser, ExclusionsSpy, isInIgnoredRangeSpy, isReplacementIgnoredSpy,
        selectMutationOperatorsSpy, selectChildNodeFinderSpy;

    beforeEach(function() {
        var MutationAnalyser, config;

        ast = JSParserWrapper.parse(src, {loc: false});
        jasmine.addMatchers(require('../util/JasmineCustomMatchers'));

        config = new MutationConfiguration(src);

        ExclusionsSpy = jasmine.createSpyObj('ExclusionUtils', ['getExclusions']);
        isInIgnoredRangeSpy = spyOn (config, 'isInIgnoredRange').and.callThrough();
        isReplacementIgnoredSpy = spyOn (config, 'isReplacementIgnored').and.callThrough();
        selectMutationOperatorsSpy = spyOn(MutationOperatorRegistry, 'selectMutationOperators').and.callThrough();
        selectChildNodeFinderSpy = spyOn(MutationOperatorRegistry, 'selectChildNodeFinder').and.callThrough();
        MutationAnalyser = proxyquire('../../src/MutationAnalyser', {
            './utils/ExclusionUtils': ExclusionsSpy,
            './MutationOperatorRegistry': MutationOperatorRegistry
        });
        mutationAnalyser = new MutationAnalyser(ast, config);
    });

    it('finds all eligible mutation operators in the given AST', function() {
        var mutationOperatorSets = mutationAnalyser.collectMutations({BLOCK_STATEMENT: true});
        expect(mutationOperatorSets.length).toEqual(2);
        expect(ExclusionsSpy.getExclusions.calls.count()).toBe(50);

        //if we call collect again the mutation collection should have been cached and returned => ExclusionSpy.getExclusions should not have been called any more times
        mutationAnalyser.collectMutations({LITERAL: true});
        expect(ExclusionsSpy.getExclusions.calls.count()).toBe(50);
        expect(mutationAnalyser.getMutationOperators()).toBe(mutationOperatorSets);
        expect(mutationAnalyser.getIgnored()).toEqual([[0, 12]]);
        expect(mutationAnalyser.getExcluded()).toEqual([[ 0, 48 ], [ 0, 48 ], [ 33, 48 ]]);
    });
});