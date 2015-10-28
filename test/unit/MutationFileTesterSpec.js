/**
 * Spec for the MutationFileTester
 * Created by martin on 26/10/15.
 */
describe('MutationFileTester', function() {
    var proxyquire = require('proxyquire'),
        PromiseUtils = require('../../src/utils/PromiseUtils'),
        MutationFileTester,
        createMutationLogMessageSpy, promiseToWriteFileSpy, calculateScoreSpy;

    beforeEach(function() {
        createMutationLogMessageSpy = jasmine.createSpy('createMutationLogMessage');
        promiseToWriteFileSpy = jasmine.createSpy('promiseToWriteFile');
        calculateScoreSpy = jasmine.createSpy('calculateScore');
        MutationFileTester = proxyquire('../../src/MutationFileTester', {
            './MutationConfiguration' : function() {},
            './MutationOperatorRegistry': {getMutationOperatorTypes: function() {}},
            './MutationOperatorWarden': function() {},
            './reporter/ReportGenerator': {createMutationLogMessage: createMutationLogMessageSpy},
            './MutationAnalyser': function() {return {collectMutations: function() {return ['ms1', 'ms2'];}, getIgnored: function(){}};},
            './JSParserWrapper': {generate: function(){}},
            './utils/IOUtils': {promiseToWriteFile: function() {return PromiseUtils.promisify(promiseToWriteFileSpy);}},
            './Mutator': function() {return {mutate: function(param) {return param;}, unMutate: function() {}};},
            'sync-exec': function() {return {status: 1};}
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
            });
    });

    it('tests a file using an exec string', function(done) {
        var config = {getMutate: 'getMutate'};
        new MutationFileTester('some.file.name', config, {calculateScore: calculateScoreSpy}).testFile('someSrc', 'gulp test')
            .then(function() {
                expect(createMutationLogMessageSpy.calls.count()).toBe(2);
                expect(calculateScoreSpy.calls.count()).toBe(2);
                expect(promiseToWriteFileSpy.calls.count()).toBe(2);
                expect(createMutationLogMessageSpy).toHaveBeenCalledWith(config, 'some.file.name', undefined, 'someSrc', 'SURVIVED' );
                done();
            });
    });
});