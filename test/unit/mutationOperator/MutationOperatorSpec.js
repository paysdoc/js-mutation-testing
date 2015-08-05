/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('MutationOperator', function() {
    var MutationOperator = require('../../../src/mutationOperator/MutationOperator');

    it('creates a mutation operator with a private _astNode attribute', function() {
        var instance = new MutationOperator({node:{}});
        expect(instance._astNode).toEqual({});
    });
});