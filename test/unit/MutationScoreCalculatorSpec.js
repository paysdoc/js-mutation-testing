/**
 * Spec for the mutation score calculator
 * Created by martin on 24/11/15.
 */
describe('MutationScoreCalculator', function() {
    var MutationScoreCalculator = require('../../src/MutationScoreCalculator'),
        mutationScoreCalculator;
    var mockScorePerFile = {
        fileA: {killed: 6, survived: 2, ignored: 0, error: 1},
        fileB: {killed: 37, survived: 5, ignored: 3, error: 0}
    };

    function feedResult(fileName) {
        function doCalculation(status, numberOfTimes, ignored) {
            var ignoredMutations = ignored;
            for (var i = 0; i < numberOfTimes; i++ ) {
                mutationScoreCalculator.calculateScore(fileName, status, ignoredMutations);
                ignoredMutations = 0;
            }
        }
        doCalculation('KILLED', mockScorePerFile[fileName].killed, mockScorePerFile[fileName].ignored);
        doCalculation('SURVIVED', mockScorePerFile[fileName].survived, 0);
        doCalculation('ERROR', mockScorePerFile[fileName].error, 0);
    }

    beforeEach(function() {
        mutationScoreCalculator = new MutationScoreCalculator();
    });

    it('calculates the score for a file', function() {
        feedResult('fileA');
        expect(mutationScoreCalculator.getScorePerFile('fileA')).toEqual(mockScorePerFile.fileA);
    });

    it('calculates the totals over all files', function() {
        feedResult('fileA');
        feedResult('fileB');
        expect(mutationScoreCalculator.getTotals()).toEqual({
            killed: 43, survived: 7, ignored: 3, error: 1
        });
    });
});
