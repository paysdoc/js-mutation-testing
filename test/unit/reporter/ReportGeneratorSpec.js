/**
 * spec for the report generator
 * @author Martin Koster [paysdoc@gmail.com], created on 16/07/15.
 * Licensed under the MIT license.
 */
describe('Report Generator', function() {
    'use strict';

    var loggerStub = jasmine.createSpyObj('logger', ['trace', 'info', 'error']),
        promiseResolver = require('../../util/dummyPromiseResolver'),
        proxyquire = require('proxyquire');

    var reportGenerator, resolve, completionTest;

    beforeEach(function() {
        resolve = promiseResolver.resolve;
        reportGenerator = proxyquire('../../../src/reporter/ReportGenerator', {
            './html/HtmlReporter': function() {return {create: resolve};},
            'path': {join: function(a, b) {return a + '/' + b;}},
            'log4js': {getLogger: function() {return loggerStub;}}
        });
    });

    it("Creates an HTML report", function(done) {
        reportGenerator.generate({}, {}, done);
        completionTest = function() {
            expect(loggerStub.info.calls.mostRecent()).toEqual({
                object: loggerStub,
                args: ['Generated the mutation HTML report in: %s', 'reports/grunt-mutation-testing'],
                returnValue: undefined
            });
        };
    });

    it("Creates an HTML report at specified directory", function(done) {
        reportGenerator.generate({dir: '.'}, {}, done);
        completionTest = function() {
            expect(loggerStub.info.calls.mostRecent()).toEqual({
                object: loggerStub,
                args: ['Generated the mutation HTML report in: %s', '.'],
                returnValue: undefined
            });
        };
    });

    it("Creates an HTML reporter with a rejection object", function(done) {
        resolve = function() {return promiseResolver.resolve('reject', {message: 'rejected message'});};
        reportGenerator.generate({}, {}, done);
        completionTest = function() {
            expect(loggerStub.error.calls.mostRecent()).toEqual({
                object: loggerStub,
                args: ['Error creating report: %s', 'rejected message'],
                returnValue: undefined
            });
        };
    });

    it("Creates an HTML reporter with a rejection message", function(done) {
        resolve = function() {return promiseResolver.resolve('reject', 'rejected');};
        reportGenerator.generate({}, {}, done);
        completionTest = function() {
            expect(loggerStub.error.calls.mostRecent()).toEqual({
                object:loggerStub,
                args: ['Error creating report: %s', 'rejected'],
                returnValue: undefined
            });
        };
    });

    it('does not break if no callback is supplied', function(done) {
        reportGenerator.generate({}, {});
        completionTest = function(){};
        done();
    });

    afterEach(function() {
        completionTest();
    });
});
