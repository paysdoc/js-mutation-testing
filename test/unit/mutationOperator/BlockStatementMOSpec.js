/**
 * Spec for the Mutation Operator base class
 * @author Martin Koster [paysdoc@gmail.com], created on 04/08/15.
 * Licensed under the MIT license.
 */
describe('BlockStatementMO', function() {
    var proxyquire = require('proxyquire'),
        BlockStatementMO,
        MutationUtilsSpy,
        node = {body: [{range: [47,50], foo: 'foo'}, {range: [51,54], bar: 'bar'}, ['baz']], someStuff: 'someStuff'},
        instances;

    beforeEach(function() {
        MutationUtilsSpy = jasmine.createSpyObj('MutationUtils', ['createMutation']);
        BlockStatementMO = proxyquire('../../../src/mutationOperator/BlockStatementMO', {
            '../utils/MutationUtils': MutationUtilsSpy
        });
        instances = BlockStatementMO.create(node);
    });

    it('creates an empty list of mutation operators', function() {
        instances = BlockStatementMO.create({});
        expect(instances.length).toEqual(0);
    });

    it('mutates a node and reverts it without affecting other parts of that node', function() {
        var instance;

        expect(instances.length).toEqual(3);
        instance = instances[1];

        instance.apply();
        expect(node.body).toEqual([{range: [47,50], foo: 'foo'}, ['baz']]);
        expect(MutationUtilsSpy.createMutation).toHaveBeenCalledWith({ range: [ 51, 54 ], bar: 'bar' }, 54, { range: [ 51, 54 ], bar: 'bar' });

        instance.apply(); //applying again should have no effect: it will not increase the call count of the spy
        expect(node.body).toEqual([{range: [47,50], foo: 'foo'}, ['baz']]);
        expect(MutationUtilsSpy.createMutation.calls.count()).toEqual(1);

        node.someStuff = 'otherStuff';
        instance.revert();
        expect(node.body).toEqual([{range: [47,50], foo: 'foo'}, {range: [51,54], bar: 'bar'}, ['baz']]);
        expect(node.someStuff).toEqual('otherStuff');

        instance.revert(); //reverting again should have no effect
        expect(node.body).toEqual([{range: [47,50], foo: 'foo'}, {range: [51,54], bar: 'bar'}, ['baz']]);
    });

    it('retrieves the replacement value and its coordinates', function() {
        var second = instances[1];
        expect(instances[0].getReplacement()).toEqual({value: null, begin: 47, end: 50});

        second.apply(); //remove the element: it should still be returned with its coordinates
        expect(second.getReplacement()).toEqual({value: null, begin: 51, end: 54});
    });
});