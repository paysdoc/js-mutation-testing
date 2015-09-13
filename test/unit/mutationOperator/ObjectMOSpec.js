/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('ObjectMO', function() {
    var proxyquire = require('proxyquire'),
        ObjectMO,
        MutationUtilsSpy,
        prop1 = {"range": [43,49], "kind": "init"},
        prop2 = {"range": [51,57], "kind": "init"},
        node = {properties: [prop1, prop2]},
        instances;

    beforeEach(function() {
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createMutation']);
        ObjectMO = proxyquire('../../../src/mutationOperator/ObjectMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instances = ObjectMO.create(node);
    });

    it('creates an empty list of mutation operators', function() {
        instances = ObjectMO.create({properties: ['a', 'b']});
        expect(instances.length).toEqual(0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        var instance;

        expect(instances.length).toEqual(2);
        instance = instances[1];

        instance.apply();
        expect(node.properties).toEqual([prop1]);
        instance.apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.properties).toEqual([prop1]);
        expect(MutationUtilsSpy.createMutation.calls.count()).toEqual(1);

        instance.revert();
        expect(node.properties).toEqual([prop1, prop2]);
        instance.revert(); //reverting again should have no effect
        expect(node.properties).toEqual([prop1, prop2]);

        //check that the address references of each property are the same (as these properties may have been assigned to other mutation operators)
        expect(node.properties[0] === prop1).toBeTruthy();
        expect(node.properties[1] === prop2).toBeTruthy();

        expect(MutationUtilsSpy.createMutation).toHaveBeenCalledWith(prop2, 57, prop2);
    });

    it('retrieves the replacement value and its coordinates', function() {
        expect(instances[0].getReplacement()).toEqual({value: null, begin: 43, end: 49});

        instances[0].apply(); //should still be the same after the mutation has been applied
        expect(instances[0].getReplacement()).toEqual({value: null, begin: 43, end: 49});
    });
});