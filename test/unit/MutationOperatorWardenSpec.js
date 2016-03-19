/**
 * Spec for the Mutation operator warden
 * @author Martin Koster [paysdoc@gmail.com], created on 28/09/15.
 * Licensed under the MIT license.
 */
describe('MutationOperatorWarden', function() {
    var MutationOperatorWarden = require('../../src/MutationOperatorWarden'),
        mockConfig = {},
        mockConfiguration = getMockConfig(),
        JSParserWrapper = require('../../src/JSParserWrapper'),
        src = '\'use strict\'; var question = \'uh?\';',
        mockMutationTypes = [{code: 'GREEN', exclude: true}, {code: 'BLUE', exclude: false}],
        mockReplacement = '"MUTATION!"',
        mockMO = {getReplacement: function() {return mockReplacement;}},
        getReplacementSpy, node, moWarden;

    function getMockConfig() {
        return {
            get: function(key) {
                return mockConfig[key];
            }
        };
    }

    beforeEach(function() {
        mockConfig.excludeMutations = [];
        mockConfig.ignore = [/('use strict'|"use strict");/];
        mockConfig.ignoreReplacements = [];
        mockConfig.discardDefaultIgnore = [];
        getReplacementSpy = spyOn(mockMO, 'getReplacement').and.callThrough();
        node = JSParserWrapper.parse(src);
    });

    it('ignores the \'use strict\' statement', function() {
        moWarden = new MutationOperatorWarden(src, mockConfiguration, mockMutationTypes);
        expect(moWarden.getMOStatus(node, mockMO)).toBe('include');
        expect(moWarden.getMOStatus(node.body[0], mockMO)).toBe('ignore');
    });

    it('ignores the \'USE STRICT\' statement, ignoring case', function() {
        mockConfig.ignore = [/('USE STRICT'|"USE STRICT");/i];
        moWarden = new MutationOperatorWarden(src, mockConfiguration, mockMutationTypes);
        expect(moWarden.getMOStatus(node, mockMO)).toBe('include');
        expect(moWarden.getMOStatus(node.body[0], mockMO)).toBe('ignore');
    });

    it('ignores non-regex strings', function() {
        mockConfig.ignore = ['\'uh?\''];
        moWarden = new MutationOperatorWarden(src, mockConfiguration, mockMutationTypes);
        expect(moWarden.getMOStatus(node.body[1].declarations[0].init, mockMO)).toBe('ignore');
    });

    it('ignores a given string replacement', function() {
        mockConfig.ignoreReplacements = ['MUTATION!'];
        moWarden = new MutationOperatorWarden(src, mockConfiguration, mockMutationTypes);

        expect(moWarden.getMOStatus(node, mockMO)).toBe('ignore');
        mockReplacement = 'MUTETION';
        expect(moWarden.getMOStatus(node, mockMO)).toBe('include');
    });

    it('ignores a mutation based on given case sensitive regex replacement', function() {
        mockConfig.ignoreReplacements = [/MUTA/g];
        moWarden = new MutationOperatorWarden(src, mockConfiguration, mockMutationTypes);

        mockReplacement = 'MUTATION!';
        expect(moWarden.getMOStatus(node, mockMO)).toBe('ignore');
        mockReplacement = 'MUTETION!';
        expect(moWarden.getMOStatus(node, mockMO)).toBe('include');

    });

    it('excludes a MutationOperator if its code matches any exclusion codes', function() {
        moWarden = new MutationOperatorWarden(src, mockConfiguration, mockMutationTypes);
        expect(moWarden.getMOStatus(node, mockMO, 'GREEN')).toBe('exclude');
    });

    it('throws an exception if it comes across a MutationOperator class without a code', function() {
        moWarden = new MutationOperatorWarden(src, mockConfiguration, [{}]);
        function callGetMOStatus() {
            moWarden.getMOStatus(node, mockMO);
        }
        expect(callGetMOStatus).toThrowError('expected a MutationOperation class with a code, but code was undefined');
    });
});