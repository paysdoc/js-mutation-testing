/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('ArithmeticOperatorMO', function() {
    var proxyquire = require('proxyquire'),
        ArithmeticOperatorMO,
        MutationUtilsSpy,
        node = {operator: '*', left: {range: [2,3]}, right: {range: [5, 6]}, someStuff: 'someStuff'},
        instances;

    beforeEach(function() {
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createOperatorMutation']);
        ArithmeticOperatorMO = proxyquire('../../../src/mutationOperator/ArithmeticOperatorMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instances = ArithmeticOperatorMO.create(node);
    });

    it('creates an empty list of mutation operators', function() {
        instances = ArithmeticOperatorMO.create({});
        expect(instances.length).toEqual(0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        var instance;

        expect(instances.length).toEqual(1);
        instance = instances[0];

        instance.apply();
        expect(node.operator).toEqual('/');
        expect(MutationUtilsSpy.createOperatorMutation).toHaveBeenCalledWith({ operator: '/', left: {range: [2,3]}, right: {range: [5, 6]}, someStuff: 'someStuff'}, '/', '*');

        instance.apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.operator).toEqual('/');
        expect(MutationUtilsSpy.createOperatorMutation.calls.count()).toEqual(1);

        node.someStuff = 'otherStuff';
        instance.revert();
        expect(node.operator).toEqual('*');
        expect(node.someStuff).toEqual('otherStuff');

        instance.revert(); //reverting again should have no effect
        expect(node.operator).toEqual('*');
    });

    it('retrieves the replacement value and its coordinates', function() {
        expect(instances[0].getReplacement()).toEqual({value: '/', begin: 3, end: 5});

        instances[0]._original = '/';
        expect(instances[0].getReplacement()).toEqual({value: '*', begin: 3, end: 5});
    });
});