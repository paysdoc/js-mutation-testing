/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('ArrayExpressionMO', function() {
    var proxyquire = require('proxyquire'),
        ArrayExpressionMO,
        MutationUtilsSpy,
        node = {elements: [{foo: 'foo'}, 'bar', ['baz']], someStuff: 'someStuff'},
        instances;

    beforeEach(function() {
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createAstArrayElementDeletionMutation']);
        ArrayExpressionMO = proxyquire('../../../src/mutationOperator/ArrayExpressionMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instances = ArrayExpressionMO.create(node);
    });

    it('creates an empty list of mutation operators', function() {
        instances = ArrayExpressionMO.create({});
        expect(instances.length).toEqual(0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        var instance;

        expect(instances.length).toEqual(3);
        instance = instances[1];

        instance.apply();
        expect(node.elements).toEqual([{foo: 'foo'}, ['baz']]);

        instance.apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.elements).toEqual([{foo: 'foo'}, ['baz']]);

        node.someStuff = 'otherStuff';
        instance.revert();
        expect(node.elements).toEqual([{foo: 'foo'}, 'bar', ['baz']]);
        expect(node.someStuff).toEqual('otherStuff');

        instance.revert(); //reverting again should have no effect
        expect(node.elements).toEqual([{foo: 'foo'}, 'bar', ['baz']]);

        expect(MutationUtilsSpy.createAstArrayElementDeletionMutation.calls.count()).toEqual(1);
        expect(MutationUtilsSpy.createAstArrayElementDeletionMutation).toHaveBeenCalledWith([{foo: 'foo'}, 'bar', ['baz']], 1);
    });
});