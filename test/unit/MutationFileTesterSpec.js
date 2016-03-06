/**
 * Spec for the MutationFileTester
 * Created by martin on 26/10/15.
 */
describe('MutationFileTester', function() {
    var proxyquire = require('proxyquire'),
        PromiseUtils = require('../../src/utils/PromiseUtils'),
        mockArrayGetter = function() {return [];},
        MutationFileTester, mockIOUtils,
        createMutationLogMessageSpy, promiseToWriteFileSpy, calculateScoreSpy, loggerSpy;

    mockIOUtils = {promiseToWriteFile: function() {return PromiseUtils.promisify(promiseToWriteFileSpy);}};
    beforeEach(function() {
        loggerSpy = jasmine.createSpyObj('logger', ['trace', 'info', 'error']);
        createMutationLogMessageSpy = jasmine.createSpy('createMutationLogMessage');
        promiseToWriteFileSpy = jasmine.createSpy('promiseToWriteFile');
        calculateScoreSpy = jasmine.createSpy('calculateScore');
        MutationFileTester = proxyquire('../../src/MutationFileTester', {
            './MutationConfiguration' : function() {return {getLib: mockArrayGetter, getMutate: mockArrayGetter, getSpecs: mockArrayGetter};},
            './MutationOperatorRegistry': {getMutationOperatorTypes: function() {}},
            './MutationOperatorWarden': function() {},
            './reporter/ReportGenerator': {createMutationLogMessage: createMutationLogMessageSpy},
            './MutationAnalyser': function() {return {collectMutations: function() {return [['ms1'], ['ms2']];}, getIgnored: function(){}};},
            './JSParserWrapper': {stringify: function(){}},
            './utils/IOUtils': mockIOUtils,
            './Mutator': function() {return {mutate: function(param) {return param;}, unMutate: function() {}};},
            'sync-exec': function() {return {status: 0};},
            'log4js': {getLogger: function() {return loggerSpy;}}

        });
    });

    it('tests a file using a function', function(done) {
        new MutationFileTester('some.file.name', {}, {calculateScore: calculateScoreSpy}).testFile('someSrc', function(cb) {cb(0);})
            .then(function() {
                expect(createMutationLogMessageSpy.calls.count()).toBe(2);
                expect(calculateScoreSpy.calls.count()).toBe(2);
                expect(promiseToWriteFileSpy.calls.count()).toBe(2);
                expect(calculateScoreSpy).toHaveBeenCalledWith('some.file.name', 'KILLED', undefined);
                done();
            }, function(error) {
                console.error(error);
                done();
            });
    });

    it('tests a file using an exec string', function(done) {
        //var config = {getMutate: 'getMutate'};
        new MutationFileTester('some.file.name', {}, {calculateScore: calculateScoreSpy}).testFile('someSrc', 'gulp test')
            .then(function() {
                expect(createMutationLogMessageSpy.calls.count()).toBe(2);
                expect(calculateScoreSpy.calls.count()).toBe(2);
                expect(promiseToWriteFileSpy.calls.count()).toBe(2);
                expect(createMutationLogMessageSpy).toHaveBeenCalledWith(jasmine.any(Object), 'some.file.name', 'ms1', 'someSrc', 'SURVIVED' );
                done();
            }, function(error) {
                console.error(error);
                done();
            });
    });

    it('fails on an IOUtils problem', function() {
        mockIOUtils.promiseToWriteFile = PromiseUtils.promisify(function() {throw ('cannot do that!');});
        new MutationFileTester('some.file.name', {getMutate: 'getMutate'}, {calculateScore: calculateScoreSpy}).testFile('someSrc', 'gulp test')
            .then(function() {
                fail('fulfillment callback should not have been called after failure');
            });
    });
});