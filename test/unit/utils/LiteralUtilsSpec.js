/**
 * Spec for the Literals utility
 * @author Martin Koster [paysdoc@gmail.com], created on 24/09/15.
 * Licensed under the MIT license.
 */
describe('LiteralUtils', function() {
    var LiteralUtils = require('../../../src/utils/LiteralUtils');

    it('determines whether there\'s a replacement for a given literal', function() {
        expect(LiteralUtils.determineReplacement('foo')).toEqual('"MUTATION!"');
        expect(LiteralUtils.determineReplacement(3)).toEqual('4');
        expect(LiteralUtils.determineReplacement(false)).toEqual('true');
        expect(LiteralUtils.determineReplacement(/notaliteral/)).toBeFalsy();
    });
});