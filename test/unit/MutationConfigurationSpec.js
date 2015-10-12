/**
 * Specification for the mutation configuration
 * @author Martin Koster [paysdoc@gmail.com], created on 04/09/15.
 * Licensed under the MIT license.
 */
describe('MutationConfiguration', function() {

    var proxyquire = require('proxyquire'),
        src = '\'use strict\'; var question = \'uh?\';',
        MutationConfiguration, syncSpy;

    beforeEach(function() {
        syncSpy = jasmine.createSpy('sync');
        MutationConfiguration = proxyquire('../../src/MutationConfiguration', {
            'glob': {sync: syncSpy}
        });
    });

    it('creates getters from the properties in config', function() {
        var config = new MutationConfiguration({
            mutate: ['some/path', 'another/path'],
            discardDefaultIgnore: false,
            ignore: [/use struct/],
            ignoreReplacements: '"MUTATION!"',
            reporters: {text: {dir: 'someDir', file: 'someFile'}}
        });

        expect(syncSpy).toHaveBeenCalledWith('some/path', {dot: true});

        // check for the existence of the getters
        expect(config.getBasePath()).toBe('.');
        expect(config.getLogLevel()).toBe('INFO');
        expect(config.getReporters().text).toEqual({dir: 'someDir', file: 'someFile'});
        expect(config.getIgnoreReplacements()).toEqual(['"MUTATION!"']);
        expect(config.getExcludeMutations()).toEqual([]);
        expect(config.getMaxReportedMutationLength()).toBe(80);
        expect(config.getMutateProductionCode()).toBeFalsy();
        expect(config.getDiscardDefaultIgnore()).toBeFalsy();
        expect(config.getMutate()).toEqual([]); //actual expanding of code has been mocked away - hence empty array
        expect(config.getIgnore()).toEqual([/('use strict'|"use strict");/, /use struct/]);
    });

    it('creates defaults with minimal configuration', function() {
        var config = new MutationConfiguration({mutate: 'some/path'});

        expect(config.getDiscardDefaultIgnore()).toBeFalsy();
        expect(config.getIgnoreReplacements()).toEqual([]);
        expect(config.getIgnore().toString()).toBe('/(\'use strict\'|"use strict");/');
    });

    it('does not add \'use strict\' to the defaults if discardDefaultIgnore is set', function() {
        var config = new MutationConfiguration({
            mutate: 'some/path',
            discardDefaultIgnore: true,
            ignore: [/use struct/]
        });

        expect(config.getDiscardDefaultIgnore()).toBeTruthy();
        expect(config.getIgnoreReplacements()).toEqual([]);
        expect(config.getIgnore()).toEqual([/use struct/]);
    });

    it('logs an error if required options are not set', function() {
        var breakit = function() {return new MutationConfiguration(src)};
        expect(breakit).toThrowError('Not all required options have been set');
    });
});