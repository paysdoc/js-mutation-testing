/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('MutationOperator', function() {
    var MutationOperator = require('../../../src/mutationOperator/MutationOperator');

    it('creates a mutation operator with a private _astNode attribute', function() {
        var node = {someProp: 'someProp'},
            instance = new MutationOperator(node);
        expect(instance._astNode).toEqual(node);
    });

    it('retrieves the replacement value and its coordinates', function() {
        expect(new MutationOperator({someProp: 'someProp'}).getReplacement()).toEqual({value: null, begin: 0, end: 0});
    });
});