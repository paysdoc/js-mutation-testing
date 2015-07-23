/**
 * Spec for the HtmlReporter
 * @author Martin Koster [paysdoc@gmail.com], created on 20/07/15.
 * Licensed under the MIT license.
 */
describe('HtmlReporter', function() {
    'use strict';

    var promiseResolver = require('../../../util/dummyPromiseResolver'),
        fileHtmlBuilderSpy = {createFileReports: promiseResolver.resolve},
        indexHtmlBuilderSpy = jasmine.createSpyObj('IndexHtmlBuilder', ['createIndexFile']),
        proxyquire = require('proxyquire'),
        IOUtilsMock = {createPathIfNotExists: {}, getDirectoryList: {}},
        fsMock = {readFileSync: {}, readdirSync: {}, statSync: {}},
        pathMock = {join: {}, relative: {}};


    var mocks = {
        results: [
            {filename: 'fileA'},
            {filename: 'fileB'}
        ]
    };

    var readDirStub = function() {return arguments[0] === '.' ?  mocks.dirContents : []};

    var HtmlReporter, createIndexFileCount = 0;

    beforeEach(function() {
        mocks.dirContents = [];
        spyOn(pathMock, 'join').and.callFake(function() {return arguments[0] + '/' + arguments[1]});
        spyOn(pathMock, 'relative').and.callFake(function() {return arguments[1]});
        spyOn(fsMock, 'readdirSync').and.callFake(readDirStub);
        spyOn(IOUtilsMock, 'createPathIfNotExists');
        spyOn(IOUtilsMock, 'getDirectoryList').and.callFake(function() {return arguments[0];});
        spyOn(fileHtmlBuilderSpy, 'createFileReports').and.callThrough();
        HtmlReporter = proxyquire('../../../../src/reporter/html/HtmlReporter', {
            './FileHtmlBuilder': function() {return fileHtmlBuilderSpy},
            './IndexHtmlBuilder': function() {return indexHtmlBuilderSpy},
            '../../utils/IOUtils': IOUtilsMock,
            'path': pathMock,
            'fs': fsMock
        });
    });

    it('creates nothing as results are empty', function(done) {
        var htmlReportPromise = new HtmlReporter('.').create({});
        htmlReportPromise.then(function() {
            expect(fileHtmlBuilderSpy.createFileReports.calls.count()).toEqual(1);
            createIndexFileCount++;
            done();
        });
    });

    it('creates a file path for every given result', function(done) {
        var htmlReportPromise = new HtmlReporter('.').create(mocks.results);
        htmlReportPromise.then(function() {
            expect(IOUtilsMock.getDirectoryList.calls.allArgs()).toEqual([[ '.', false ], [ undefined, true ], [ undefined, true ]]);
            createIndexFileCount++;
            done();
        });
    });

    it('creates directory indexes for every given directory in the path of the given file', function(done) {
        mocks.dirContents = ['dir1', 'dir2'];
        spyOn(fsMock, 'statSync').and.returnValue({isDirectory: function() {return true;}});
        var htmlReportPromise = new HtmlReporter('.').create(mocks.results);
        htmlReportPromise.then(function() {
            expect(fsMock.statSync.calls.allArgs()).toEqual([['./dir1'], ['./dir2']]);
            createIndexFileCount = createIndexFileCount + 3;
            done();
        });
    });

    it('retrieves stats from a file which is not a directory', function(done) {
        mocks.dirContents = ['dir1'];
        spyOn(fsMock, 'readFileSync').and.returnValue('data-mutation-stats="%7B%22stats%22:%22json stats%22%7D"');
        spyOn(fsMock, 'statSync').and.returnValue({isDirectory: function() {return false;}});
        var htmlReportPromise = new HtmlReporter('.').create(mocks.results);
        htmlReportPromise.then(function() {
            expect(fsMock.statSync.calls.allArgs()).toEqual([['./dir1']]);
            createIndexFileCount++;
            done();
        });
    });

    it('fails with a message when no stats are found', function(done) {
        mocks.dirContents = ['dir1'];
        spyOn(fsMock, 'readFileSync').and.returnValue('some dummy value');
        spyOn(fsMock, 'statSync').and.returnValue({isDirectory: function() {return false;}});
        var htmlReportPromise = new HtmlReporter('.').create(mocks.results);
        htmlReportPromise.then(function() {
            expect(fsMock.statSync.calls.allArgs()).toEqual([['./dir1']]);
            done.fail('Expected a parse error on dir1');
        }, function(error) {
            expect(error).toEqual('Unable to parse stats from file dir1, reason: TypeError: Cannot read property \'1\' of null');
            done()
        });
    });

    it('ignores index.html when collecting stats', function(done) {
        mocks.dirContents = ['index.html'];
        spyOn(fsMock, 'statSync').and.returnValue({isDirectory: function() {return false;}});
        var htmlReportPromise = new HtmlReporter('.').create(mocks.results);
        htmlReportPromise.then(function() {
            createIndexFileCount++;
            expect(fsMock.statSync.calls.allArgs()).toEqual([['./index.html']]);
            done();
        }, function(error) {
            done.fail(error)
        });
    });

    afterEach(function() {
        expect(indexHtmlBuilderSpy.createIndexFile.calls.count()).toEqual(createIndexFileCount);
    });
});