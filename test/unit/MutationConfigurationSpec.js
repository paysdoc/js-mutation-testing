/**
 * Specification for the mutation configuration
 * @author Martin Koster [paysdoc@gmail.com], created on 04/09/15.
 * Licensed under the MIT license.
 */
describe('MutationConfiguration', function() {

    var MutationConfiguration = require('../../src/MutationConfiguration');

    it('creates getters from all properties in config', function() {
        var config = new MutationConfiguration();
        expect(config.getLogLevel()).toBe('INFO');
        expect(config.getReporters().console).toBeTruthy();
        expect(config.getIgnore().toString()).toBe('/(\'use strict\'|"use strict");/');
    });


});