/**
 * spec for the mutation tester
 * Created by martin on 28/10/15.
 */
describe('MutationTester', function() {

    var proxyquire = require('proxyquire'),
        dummyResolver = function(cb) {cb && cb();},
        mockAfter = dummyResolver,
        mockConfiguration = {
            getBeforeEach: function() {return dummyResolver;},
            getBefore: function() {return dummyResolver;},
            getAfter: function() {return mockAfter;},
            getAfterEach: function() {return dummyResolver;},
            onInitComplete: function(cb) {cb();},
            getReporters: dummyResolver,
            getMutate: function() {return ['file1', 'file2'];}
        },
        mockMutationScoreCalculator = {
            getScorePerFile: function() {return 'someScore';},
            calculateScore: function() {}
        },
        mockIOUtils = {
            promiseToReadFile: function(fileName) {
                if (fileName === 'file1') {
                    throw ('There was an error');
                }
                return 'some source code';
            }
        },
        mockReportGenerator = {generate: function () {arguments[2]();}},
        mutationFileTesterSpy,
        loggerSpy,
        MutationTester;

    beforeEach(function() {
        loggerSpy = jasmine.createSpyObj('logger', ['trace', 'info', 'error']);
        mutationFileTesterSpy = jasmine.createSpy('mutationFileTester', 'testFile');
        MutationTester = proxyquire('../../src/MutationTester', {
            './MutationScoreCalculator': function() {return mockMutationScoreCalculator;},
            './MutationConfiguration': function() {return mockConfiguration;},
            './MutationFileTester': function() {return {testFile: mutationFileTesterSpy};},
            './utils/IOUtils': mockIOUtils,
            './reporter/reportGenerator': mockReportGenerator,
            'log4js': {getLogger: function() {return loggerSpy;}}
        });
    });

    it('mutates each given file and runs the given test on each mutation', function(done) {
        spyOn(mockReportGenerator, 'generate').and.callThrough();
        mutationFileTesterSpy.and.callFake(function() {return 'mutationResults';});
        mockAfter = function() {
            expect(mutationFileTesterSpy.calls.count()).toBe(1);
            expect(loggerSpy.info.calls.count()).toBe(1);
            expect(mockReportGenerator.generate.calls.count()).toBe(1);
            expect(loggerSpy.info).toHaveBeenCalledWith('Done mutating file: %s', 'file2');
            expect(mutationFileTesterSpy).toHaveBeenCalledWith('some source code', jasmine.any(Function));
            done();
        };
        new MutationTester({}).test(function() {});
    });

    it('handles a FATAL error by calling process.exit', function(done) {
        var originalExit = process.exit;
        var exitSpy = jasmine.createSpy('process', 'exit');

        Object.defineProperty(process, 'exit', {value: exitSpy});

        mockAfter = function() {
            expect(exitSpy).toHaveBeenCalledWith(1);
            expect(loggerSpy.error.calls.count()).toBe(5);
            expect(loggerSpy.error.calls.allArgs()).toEqual([
                [ 'An exception occurred after mutating the file: %s', 'file1' ],
                [ 'Error message was: %s', 'There was an error' ],
                [ 'An exception occurred after mutating the file: %s', 'file2' ],
                [ 'Error message was: %s', { severity: 'FATAL' } ],
                [ 'Error status was FATAL. All processing will now stop.' ]
            ]);
            Object.defineProperty(process, 'exit', originalExit);
            done();
        };

        mutationFileTesterSpy.and.callFake(function() {throw {severity: 'FATAL'};});
        new MutationTester({}).test();
    });
});