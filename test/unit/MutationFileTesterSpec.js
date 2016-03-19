/**
 * Spec for the MutationFileTester
 * Created by martin on 26/10/15.
 */
describe('MutationFileTester', function() {
    var proxyquire = require('proxyquire'),
        PromiseUtils = require('../../src/utils/PromiseUtils'),
        mockArrayGetter = function() {return [];},
        MutationFileTester, mockIOUtils,
        reportGeneratorSpy, promiseToWriteFileSpy, mutationScoreCalculatorSpy, mockTestRunner, loggerSpy;

    mockIOUtils = {promiseToWriteFile: function() {return PromiseUtils.promisify(promiseToWriteFileSpy);}};
    beforeEach(function() {
        loggerSpy = jasmine.createSpyObj('logger', ['trace', 'info', 'error']);
        mutationScoreCalculatorSpy = jasmine.createSpyObj('mutationScoreCalculator', ['calculateScore', 'getScorePerFile']);
        reportGeneratorSpy = jasmine.createSpyObj('ReportGenerator', ['createMutationLogMessage', 'generate']);
        promiseToWriteFileSpy = jasmine.createSpy('promiseToWriteFile');
        mockTestRunner = {runTest: function() {}};
        MutationFileTester = proxyquire('../../src/MutationFileTester', {
            './MutationConfiguration' : function() {return {get: mockArrayGetter};},
            './MutationOperatorRegistry': mockTestRunner,
            './MutationOperatorWarden': function() {},
            './TestRunner': mockTestRunner,
            './reporter/ReportGenerator': reportGeneratorSpy,
            './MutationAnalyser': function() {return {collectMutations: function() {return [['ms1'], ['ms2']];}, getIgnored: function(){}};},
            './JSParserWrapper': {stringify: function(){}},
            './utils/IOUtils': mockIOUtils,
            './Mutator': function() {return {mutate: function(param) {return param;}, unMutate: function() {}};},
            'sync-exec': function() {return {status: 0};},
            'log4js': {getLogger: function() {return loggerSpy;}}
        });
    });

    it('tests a file using a function', function(done) {
        spyOn(mockTestRunner, 'runTest').and.returnValue('KILLED');
        new MutationFileTester('some.file.name', {}, mutationScoreCalculatorSpy).testFile('someSrc', function(cb) {cb(0);})
            .then(function() {
                expect(reportGeneratorSpy.createMutationLogMessage.calls.count()).toBe(2);
                expect(mutationScoreCalculatorSpy.calculateScore.calls.count()).toBe(2);
                expect(promiseToWriteFileSpy.calls.count()).toBe(2);
                expect(mutationScoreCalculatorSpy.calculateScore).toHaveBeenCalledWith('some.file.name', 'KILLED', undefined);
                done();
            }, function(error) {
                console.error(error);
                done();
            });
    });

    it('tests a file using an exec string', function(done) {
        spyOn(mockTestRunner, 'runTest').and.returnValue('SURVIVED');
        new MutationFileTester('some.file.name', {}, mutationScoreCalculatorSpy).testFile('someSrc', 'gulp test')
            .then(function() {
                expect(reportGeneratorSpy.createMutationLogMessage.calls.count()).toBe(2);
                expect(mutationScoreCalculatorSpy.calculateScore.calls.count()).toBe(2);
                expect(promiseToWriteFileSpy.calls.count()).toBe(2);
                expect(reportGeneratorSpy.createMutationLogMessage).toHaveBeenCalledWith(jasmine.any(Object), 'some.file.name', 'ms1', 'someSrc', 'SURVIVED' );
                done();
            }, function(error) {
                console.error(error);
                done();
            });
    });

    it('fails on an IOUtils problem', function() {
        mockIOUtils.promiseToWriteFile = PromiseUtils.promisify(function() {throw ('cannot do that!');});
        new MutationFileTester('some.file.name', {getMutate: 'getMutate'}, mutationScoreCalculatorSpy).testFile('someSrc', 'gulp test')
            .then(function() {
                fail('fulfillment callback should not have been called after failure');
            });
    });
});