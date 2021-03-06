/**
 * Specification for the mutation configuration
 * @author Martin Koster [paysdoc@gmail.com], created on 04/09/15.
 * Licensed under the MIT license.
 */
describe('MutationConfiguration', function() {

    var proxyquire = require('proxyquire'),
        Q = require('q'),
        src = '\'use strict\'; var question = \'uh?\';',
        MutationConfiguration, mockGlob;

    beforeEach(function() {
        mockGlob = {sync: function(file) {return file;}};
        spyOn(mockGlob, 'sync').and.callThrough();
        MutationConfiguration = proxyquire('../../src/MutationConfiguration', {
            'glob': mockGlob,
            './utils/CopyUtils': {copyToTemp: function() {return new Q('temp/dir/path');}}
        });
    });

    it('creates getters from the properties in config', function() {
        var config = new MutationConfiguration({
            lib: ['some/path', 'another/path', 'some/spec/path'],
            mutate: ['some/path', 'another/path'],
            specs: 'some/spec/path',
            discardDefaultIgnore: false,
            ignore: [/use struct/],
            ignoreReplacements: '"MUTATION!"',
            reporters: {text: {dir: 'someDir', file: 'someFile'}}
        });

        expect(mockGlob.sync).toHaveBeenCalledWith('some/path', {dot: true});

        // check for the existence of the getters
        expect(config.get('basePath')).toBe('.');
        expect(config.get('logLevel')).toBe('INFO');
        expect(config.get('reporters').text).toEqual({dir: 'someDir', file: 'someFile'});
        expect(config.get('ignoreReplacements')).toEqual(['"MUTATION!"']);
        expect(config.get('excludeMutations')).toEqual([]);
        expect(config.get('maxReportedMutationLength')).toBe(80);
        expect(config.get('mutateProductionCode')).toBeFalsy();
        expect(config.get('discardDefaultIgnore')).toBeFalsy();
        expect(config.get('mutate')).toEqual(['some/path', 'another/path']);
        expect(config.get('ignore')).toEqual([/('use strict'|"use strict");/, /use struct/]);
    });

    it('creates defaults with minimal configuration', function() {
        var config = new MutationConfiguration({lib: 'some/lib/path', mutate: 'some/path', specs: 'some/spec/path'});

        expect(config.get('discardDefaultIgnore')).toBeFalsy();
        expect(config.get('ignoreReplacements')).toEqual([]);
        expect(config.get('ignore').toString()).toBe('/(\'use strict\'|"use strict");/');
    });

    it('does not add \'use strict\' to the defaults if discardDefaultIgnore is set', function() {
        var config = new MutationConfiguration({
            lib: ['some/path', 'some/spec/path'],
            mutate: ['some/path'],
            specs: ['some/spec/path'],
            discardDefaultIgnore: true,
            ignore: [/use struct/]
        });

        expect(config.get('discardDefaultIgnore')).toBeTruthy();
        expect(config.get('ignoreReplacements')).toEqual([]);
        expect(config.get('ignore')).toEqual([/use struct/]);
    });

    it('logs an error if required options are not set', function() {
        var breakit = function() {return new MutationConfiguration(src);};
        expect(breakit).toThrowError('Not all required options have been set');
    });

    it('has maintenance functions (before, after, beforeEach, etc...) that are don\'t have getters', function() {
        var config = new MutationConfiguration({lib: ['some/path'], mutate: ['some/path'], specs: ['some/spec/path'], ignore: [/use struct/]}),
            dummySpy = jasmine.createSpy('dummy');
        config.get('before')(dummySpy);
        config.get('beforeEach')(dummySpy);
        config.get('after')(dummySpy);
        config.get('afterEach')(dummySpy);

        expect(dummySpy.calls.count()).toBe(4);
    });

    it('executes a given callback once the file initialization is complete', function(done) {
        var config = new MutationConfiguration({lib: 'some/path', mutate: 'some/path', specs: 'some/spec/path', ignore: [/use struct/], 'mutateProductionCode': true}),
            deferred = Q.defer();

        config.onInitComplete(deferred.resolve);
        deferred.promise.then(done); //no need to expect anything: if done is called, we know that the function has done its job
    });
});