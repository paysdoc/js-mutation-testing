/**
 * Specification for the mutation configuration
 * @author Martin Koster [paysdoc@gmail.com], created on 04/09/15.
 * Licensed under the MIT license.
 */
describe('MutationConfiguration', function() {

    var MutationConfiguration = require('../../src/MutationConfiguration'),
        JSParserWrapper = require('../../src/JSParserWrapper'),
        src = '\'use strict\'; var question = \'uh?\';',
        node;

    beforeEach(function() {
        node = JSParserWrapper.parse(src);
    });

    it('creates getters from all properties in config', function() {
        var config = new MutationConfiguration(src);
        expect(config.getLogLevel()).toBe('INFO');
        expect(config.getReporters().console).toBeTruthy();
        expect(config.getIgnore().toString()).toBe('/(\'use strict\'|"use strict");/');
    });

    it('ignores the \'use strict\' statement', function() {
        var config = new MutationConfiguration(src);
        expect(config.isInIgnoredRange(node)).toBeFalsy();
        expect(config.isInIgnoredRange(node.body[0], src)).toBeTruthy();
    });

    it('does not ignore the \'use strict\' statement if option "discardDefaultIgnore" is set to true unless ignore is explicitly set to ignore "use strict', function() {
        var config = new MutationConfiguration(src, {discardDefaultIgnore: true});
        expect(config.isInIgnoredRange(node.body[0])).toBeFalsy();

        config = new MutationConfiguration(src, {discardDefaultIgnore: true, ignore: /('use strict'|"use strict");/});
        expect(config.isInIgnoredRange(node.body[0])).toBeTruthy();
    });

    it('ignores non-regex strings', function() {
        var config = new MutationConfiguration(src, {ignore: '\'uh?\''});
        expect(config.isInIgnoredRange(node.body[1].declarations[0].init)).toBeTruthy();
    });

    it('ignores a given string replacement', function() {
        var config = new MutationConfiguration(src);
        expect(config.isReplacementIgnored()).toBeFalsy();

        config = new MutationConfiguration(src, {ignoreReplacement: 'MUTATION!'});
        expect(config.isReplacementIgnored('MUTATION')).toBeFalsy();
        expect(config.isReplacementIgnored('MUTATION!')).toBeTruthy();

    });

    it('ignores a given regex replacement', function() {
        var config = new MutationConfiguration(src);
        expect(config.isReplacementIgnored()).toBeFalsy();

        config = new MutationConfiguration(src, {ignoreReplacement: /MUTA/g});
        expect(config.isReplacementIgnored('MUTATION')).toBeTruthy();
        expect(config.isReplacementIgnored('MUTETION')).toBeFalsy();

    });
});