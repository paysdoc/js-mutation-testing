/**
 * Spec for the Mutator
 * @author Martin Koster [paysdoc@gmail.com], created on 24/09/15.
 * Licensed under the MIT license.
 */
describe('Mutator', function() {
    var proxyquire = require('proxyquire'),
        Mutator, tokenizeSpy, applyMutationSpy, revertMutationSpy;

    var mockMutationHandler = {applyMutation: function() {
        return [
            {range: [10,46], begin: 10, end: 34, line: 3, col: 7, original: 'foo', replacement: 'bar'},
            {range: [10,46], begin: 12, end: 19, line: 3, col: 12, original: 'foo', replacement: ''}
        ]
    }};

    function mockTokenize() {
        return [
            {
                "type": "Punctuator",
                "value": ")",
                "range": [10,11]
            },
            {
                "type": "Punctuator",
                "value": "(",
                "range": [18,19]
            }
        ]
    }

    beforeEach(function() {
        tokenizeSpy = spyOn({tokenize: mockTokenize}, 'tokenize').and.callThrough();
        applyMutationSpy = spyOn(mockMutationHandler, 'applyMutation').and.callThrough();
        revertMutationSpy = jasmine.createSpy('revertMutation');
        mockMutationHandler.revertMutation = revertMutationSpy;
        Mutator = proxyquire('../../src/Mutator', {
            './MutationOperatorHandler': function() {return mockMutationHandler;},
            './JSParserWrapper': {tokenize: tokenizeSpy}
        });
    });

    it('applies a mutation to the AST and returns a calibrated mutation description', function() {
        var mutator = new Mutator('dummySrc');

        var results = mutator.mutate(['some', 'dummy', 'data']);
        expect(tokenizeSpy).toHaveBeenCalledWith('dummySrc', {range: true});
        expect(revertMutationSpy.calls.count()).toBe(1); //mutate always calls unMutate first to ensure that no more than 1 mutation set is ever applied

        expect(applyMutationSpy).toHaveBeenCalledWith(['some', 'dummy', 'data']);
        expect(results[0]).toEqual({range: [10,46], begin: 11, end: 34, line: 3, col: 7, original: 'foo', replacement: 'bar'});
        expect(results[1]).toEqual({range: [10,46], begin: 12, end: 18, line: 3, col: 12, original: 'foo', replacement: ''});
    });

    it('reverts the last mutations applied to the AST', function() {
        var mutator = new Mutator('dummySrc');

        mutator.unMutate();
        expect(tokenizeSpy).toHaveBeenCalledWith('dummySrc', {range: true});
        expect(revertMutationSpy.calls.count()).toBe(1);
    });
});